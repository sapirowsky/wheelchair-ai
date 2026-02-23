import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import type { Impediment } from "./wheel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImpedimentManagerProps {
  impediments: Array<Impediment>;
  onImpedimentsChange: (impediments: Array<Impediment>) => void;
}

export function ImpedimentManager({
  impediments,
  onImpedimentsChange,
}: ImpedimentManagerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bulkNames, setBulkNames] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;

    const newImpediment: Impediment = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim() || undefined,
    };

    onImpedimentsChange([...impediments, newImpediment]);
    setName("");
    setDescription("");
  };

  const handleBulkAdd = () => {
    if (!bulkNames.trim()) return;

    const lines = bulkNames
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return;

    const newImpediments: Impediment[] = lines.map((name) => ({
      id: `${Date.now()}-${Math.random()}`,
      name,
    }));

    onImpedimentsChange([...impediments, ...newImpediments]);
    setBulkNames("");
  };

  const handleDelete = (id: string) => {
    onImpedimentsChange(impediments.filter((i) => i.id !== id));
  };

  const handleDeleteAll = () => {
    onImpedimentsChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zarządzaj przeszkodami</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Dodaj pojedynczo</TabsTrigger>
            <TabsTrigger value="bulk">Import masowy</TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="space-y-2">
            <div className="space-y-2">
              <Input
                placeholder="Nazwa przeszkody"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Input
                placeholder="Opis (opcjonalne)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={!name.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="bulk" className="space-y-2">
            <div className="space-y-2">
              <Textarea
                placeholder="Wpisz nazwy przeszkód, po jednej w linii\nPrzykład:\nprzeszkoda1\nprzeszkoda2\nprzeszkoda3"
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                rows={6}
              />
              <Button
                onClick={handleBulkAdd}
                disabled={!bulkNames.trim()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Dodaj wszystkich
              </Button>
              <p className="text-xs text-muted-foreground">
                Wklej wiele nazw przeszkód, po jednej w linii.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {impediments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nie dodano jeszcze żadnych przeszkód
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Łącznie przeszkód: {impediments.length}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Usuń wszystkie
                </Button>
              </div>
              {impediments.map((impediment) => (
                <div
                  key={impediment.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{impediment.name}</p>
                    {impediment.description && (
                      <p className="text-xs text-muted-foreground">
                        {impediment.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(impediment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}