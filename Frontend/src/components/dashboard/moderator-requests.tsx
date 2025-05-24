'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config/config';

// Interface for moderator request
interface ModeratorRequest {
  reason: string;
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user: {
    phone_no: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    gender: string;
    role: string;
    id: string;
    created_at: string;
    university?: {
      name: string;
      email: string;
      id: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export function ModeratorRequests() {
  const [requests, setRequests] = useState<ModeratorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingRequestIds, setProcessingRequestIds] = useState<Set<string>>(new Set());

  // Fetch moderator requests from the API
  const fetchModeratorRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/moderator-requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch moderator requests');
      }

      const data = await response.json();
      setRequests(data.filter((req: ModeratorRequest) => req.status === 'pending'));
    } catch (error) {
      console.error('Error fetching moderator requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load moderator requests. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Approve a moderator request
  const approveRequest = async (requestId: string) => {
    setProcessingRequestIds(prev => new Set(prev).add(requestId));
    try {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/moderator-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve moderator request');
      }

      // Update the local state to reflect the change
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, status: 'approved' as const } : req
        )
      );
      
      toast({
        title: 'Success',
        description: 'Moderator request approved successfully!',
      });
    } catch (error) {
      console.error('Error approving moderator request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve moderator request. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setProcessingRequestIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Reject a moderator request
  const rejectRequest = async (requestId: string) => {
    setProcessingRequestIds(prev => new Set(prev).add(requestId));
    try {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/moderator-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject moderator request');
      }

      // Update the local state to reflect the change
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' as const } : req
        )
      );
      
      toast({
        title: 'Success',
        description: 'Moderator request rejected successfully!',
      });
    } catch (error) {
      console.error('Error rejecting moderator request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject moderator request. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setProcessingRequestIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Load moderator requests when component mounts
  useEffect(() => {
    fetchModeratorRequests();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Moderator Requests</h2>
        <Button onClick={fetchModeratorRequests} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Review and manage requests from users who want to become moderators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p>No moderator requests found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.user.first_name} {request.user.last_name}
                    </TableCell>
                    <TableCell>{request.user.email}</TableCell>
                    <TableCell>{request.user.university?.name || 'N/A'}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : request.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-green-50 hover:bg-green-100 text-green-700"
                            onClick={() => approveRequest(request.id)}
                            disabled={processingRequestIds.has(request.id)}
                          >
                            {processingRequestIds.has(request.id) ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-red-50 hover:bg-red-100 text-red-700"
                            onClick={() => rejectRequest(request.id)}
                            disabled={processingRequestIds.has(request.id)}
                          >
                            {processingRequestIds.has(request.id) ? 'Processing...' : 'Reject'}
                          </Button>
                        </div>
                      )}
                    </TableCell>
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
