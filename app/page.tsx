import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <Card className="max-w-md">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold">Project Lung</h1>
          <p className="text-muted-foreground">
            EV bus dispatch decision support system
          </p>
          <Button>Test Button</Button>
        </CardContent>
      </Card>
    </main>
  );
}