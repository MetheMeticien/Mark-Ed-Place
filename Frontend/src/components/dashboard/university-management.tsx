'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config/config';

// University interface to match the API response
interface University {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string | null;
}

export function UniversityManagement() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingUniversity, setIsAddingUniversity] = useState(false);
  const [newUniversity, setNewUniversity] = useState({ name: '', email: '', latitude: 23.66, longitude: 23.66 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch universities from the API
  const fetchUniversities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/universities`);
      if (!response.ok) {
        throw new Error('Failed to fetch universities');
      }
      const data = await response.json();

      setUniversities(data);
      
      
    } catch (error) {
      console.error('Error fetching universities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load universities. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new university
  const addUniversity = async () => {
    if (!newUniversity.name || !newUniversity.email) {
      toast({
        title: 'Error',
        description: 'Please provide both name and email for the university.',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingUniversity(true);
    try {
      const token = localStorage.getItem('access_token');

      newUniversity.latitude = 23.66;
      newUniversity.longitude = 23.66;
      console.log(newUniversity);
      const response = await fetch(`${API_CONFIG.BASE_URL}/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUniversity),
      });

      if (!response.ok) {
        throw new Error('Failed to add university');
      }

      const addedUniversity = await response.json();
      setUniversities([...universities, addedUniversity]);
      setNewUniversity({ name: '', email: '', latitude: 23.66, longitude: 23.66 });
      setIsDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'University added successfully!',
      });
    } catch (error) {
      console.error('Error adding university:', error);
      toast({
        title: 'Error',
        description: 'Failed to add university. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingUniversity(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Load universities when component mounts
  useEffect(() => {
    fetchUniversities();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">University Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add University</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New University</DialogTitle>
              <DialogDescription>
                Add a new university to the system. Please provide the university name and email domain.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newUniversity.name}
                  onChange={(e) => setNewUniversity({ ...newUniversity, name: e.target.value })}
                  className="col-span-3"
                  placeholder="University of Example"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email Domain
                </Label>
                <Input
                  id="email"
                  value={newUniversity.email}
                  onChange={(e) => setNewUniversity({ ...newUniversity, email: e.target.value })}
                  className="col-span-3"
                  placeholder="example.edu"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={addUniversity}
                disabled={isAddingUniversity || !newUniversity.name || !newUniversity.email}
              >
                {isAddingUniversity ? 'Adding...' : 'Add University'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Universities</CardTitle>
          <CardDescription>
            Manage the universities in the system. Students will be able to select from these universities during signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading universities...</p>
            </div>
          ) : universities.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p>No universities found. Add one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email Domain</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((university) => (
                  <TableRow key={university.id}>
                    <TableCell className="font-medium">{university.name}</TableCell>
                    <TableCell>{university.email}</TableCell>
                    <TableCell>{formatDate(university.created_at)}</TableCell>
                    <TableCell>{formatDate(university.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
