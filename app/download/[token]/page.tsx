/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Download, FileIcon, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DownloadPage() {
  const params = useParams();
  const token = params.token as string;
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // Fetch file metadata
    axios.get(`/api/files/public/${token}`)
      .then(res => {
        setFile(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.error || 'Arquivo não encontrado');
        setLoading(false);
      });
  }, [token]);

  const handleDownload = () => {
    window.location.href = `/api/f/${token}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const isExpired = (expiresAt: string, isPermanent: boolean) => {
    if (isPermanent) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              Arquivo não encontrado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {error || 'O arquivo que você está procurando não existe ou foi removido.'}
            </p>
            <Link href="/">
              <Button className="w-full">
                Voltar para a Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expired = isExpired(file.expiresAt, file.isPermanent);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileIcon className="w-6 h-6" />
            Download de Arquivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg truncate">{file.filename}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{formatBytes(file.size)}</Badge>
                {expired ? (
                  <Badge variant="destructive">Expirado</Badge>
                ) : file.isPermanent ? (
                  <Badge variant="secondary">Permanente</Badge>
                ) : (
                  <Badge variant="outline">Temporário</Badge>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {file.downloadCount} download(s)
              </p>
              {!file.isPermanent && (
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expira em: {formatDate(file.expiresAt)}
                </p>
              )}
            </div>
          </div>

          {/* Download Button */}
          {expired ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Este arquivo expirou e não está mais disponível para download.
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleDownload}
              className="w-full"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar Arquivo
            </Button>
          )}

          {/* Footer */}
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-gray-600 mb-3">
              Compartilhe seus arquivos facilmente
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Enviar meu arquivo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
