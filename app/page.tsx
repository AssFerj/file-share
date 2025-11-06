"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "react-toastify";
import { Upload, Copy, CheckCircle, ArrowRight, Zap, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error("Selecione um arquivo primeiro!");
    
    setUploading(true);
    setProgress(0);
    
    try {
      const { data } = await axios.post("/api/upload", { 
        filename: file.name, 
        size: file.size 
      });
      const { uploadUrl, fileId, publicToken } = data;

      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });

      await axios.post("/api/upload/complete", { fileId });
      
      // Generate download page URL
      const downloadUrl = `${window.location.origin}/download/${publicToken}`;
      setLink(downloadUrl);
      toast.success("Upload concluído!");
      setFile(null);
      setProgress(0);
    } catch (err) {
      console.error(err);
      toast.error("Erro no upload.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Compartilhe arquivos de forma <span className="text-blue-600">rápida e segura</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Envie arquivos de até 4GB e gere links de compartilhamento instantaneamente. 
          Sem cadastro obrigatório, sem complicações.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Enviar Arquivo
          </CardTitle>
          <p className="text-sm text-gray-600">
            Faça upload e receba um link para compartilhar. Válido por 5 horas.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                setFile(selectedFile);
                setLink(""); // Clear previous link
              }}
              disabled={uploading}
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="secondary">{formatBytes(file.size)}</Badge>
                <span className="truncate">{file.name}</span>
              </div>
            )}
          </div>

          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Enviando...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? "Enviando..." : "Fazer Upload Grátis"}
          </Button>

          {link && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Upload concluído com sucesso!
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Link de compartilhamento:</p>
                  <div className="flex gap-2">
                    <Input
                      value={link}
                      readOnly
                      className="bg-white"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Este link expira em 5 horas
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Rápido e Fácil</h3>
            <p className="text-sm text-gray-600">
              Upload direto para a nuvem sem complicações. Compartilhe em segundos.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Seguro</h3>
            <p className="text-sm text-gray-600">
              Seus arquivos são armazenados com segurança na infraestrutura Cloudflare.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Temporário</h3>
            <p className="text-sm text-gray-600">
              Links expiram automaticamente. Privacidade garantida.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Section */}
      {/* <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Planos e Preços</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plano Gratuito</CardTitle>
                <Badge variant="secondary">Grátis</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">R$ 0</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Arquivos de até 4GB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Links válidos por 5 horas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Upload ilimitado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Sem anúncios
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">
                  Usar Grátis
                </Link>
              </Button>
            </CardContent>
          </Card>

          
          <Card className="border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-500">Mais Popular</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plano Premium</CardTitle>
                <Badge>Pro</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">R$ 9,99</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Arquivos de até 50GB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Links válidos por 30 dias
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Upload ilimitado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Suporte prioritário
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Histórico de arquivos
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register">
                  Começar Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div> */}

      {/* CTA Section */}
      {/* <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-gray-700 mb-6">
            Crie uma conta gratuita e comece a compartilhar arquivos agora mesmo.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
