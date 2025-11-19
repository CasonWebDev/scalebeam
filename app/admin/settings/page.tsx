import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as configurações da plataforma</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Nome</label>
            <Input defaultValue="Admin UXER" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input type="email" defaultValue="admin@uxer.com" />
          </div>
          <Button>Salvar Alterações</Button>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Sistema</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Notificações por Email</p>
              <p className="text-sm text-muted-foreground">
                Receber notificações quando novos projetos forem criados
              </p>
            </div>
            <Button variant="outline" size="sm">
              Ativado
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Modo Escuro</p>
              <p className="text-sm text-muted-foreground">
                Aparência do sistema
              </p>
            </div>
            <Button variant="outline" size="sm">
              Ativado
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
