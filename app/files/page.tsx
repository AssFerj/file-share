/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useSWR from "swr";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import { Copy, Download, Trash2, FileIcon, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function MyFilesPage() {
  const { data: files, isLoading, mutate } = useSWR("/api/files", fetcher);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; file: any | null }>({
    open: false,
    file: null,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/download/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const openDeleteDialog = (file: any) => {
    setDeleteDialog({ open: true, file });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, file: null });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.file) return;
    
    setDeleting(deleteDialog.file.id);
    try {
      await axios.delete(`/api/files/${deleteDialog.file.id}`);
      toast.success("Arquivo deletado com sucesso!");
      mutate(); // Refresh list
      closeDeleteDialog();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao deletar arquivo");
    } finally {
      setDeleting(null);
    }
  };

  const isExpired = (expiresAt: string, isPermanent: boolean) => {
    if (isPermanent) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Meus Arquivos</h1>
        <p className="text-gray-600">
          {files?.length || 0} arquivo(s) enviado(s)
        </p>
      </div>

      {!files || files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Nenhum arquivo ainda</h3>
            <p className="text-gray-600 mb-4">
              Você ainda não enviou nenhum arquivo.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Enviar Primeiro Arquivo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {files.map((file: any) => {
            const expired = isExpired(file.expiresAt, file.isPermanent);
            
            return (
              <Card key={file.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <h3 className="font-semibold truncate">{file.filename}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <Badge variant="secondary">{formatBytes(file.size)}</Badge>
                        {expired ? (
                          <Badge variant="destructive">Expirado</Badge>
                        ) : file.isPermanent ? (
                          <Badge variant="secondary">Permanente</Badge>
                        ) : (
                          <Badge variant="outline">Temporário</Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {file.downloadCount} download(s)
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p>Enviado {dayjs(file.createdAt).fromNow()}</p>
                        {!file.isPermanent && (
                          <p className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {expired ? 
                              "Expirado" : 
                              `Expira ${dayjs(file.expiresAt).fromNow()}`
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!expired && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyLink(file.publicToken)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Link
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/download/${file.publicToken}`, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                        </>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(file)}
                        disabled={deleting === file.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    </div>
                  </div>

                  {expired && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800">
                        Este arquivo expirou e não está mais disponível para download. Você pode deletá-lo para liberar espaço.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este arquivo?
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialog.file && (
            <div className="py-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <FileIcon className="w-5 h-5 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{deleteDialog.file.filename}</p>
                  <p className="text-sm text-gray-600">{formatBytes(deleteDialog.file.size)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Esta ação não pode ser desfeita. O arquivo será removido permanentemente do sistema e do armazenamento.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleting !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting !== null}
            >
              {deleting ? "Deletando..." : "Deletar Arquivo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
