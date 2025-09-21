
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Station } from '../hooks/useSupabaseData';

interface StationEditFormProps {
  station: Station;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const StationEditForm = ({ station, isOpen, onClose, onSuccess }: StationEditFormProps) => {
  const [formData, setFormData] = useState({
    name: station.name,
    code: station.code,
    address: station.address || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Error",
        description: "Please enter station name and code",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('stations')
        .update({
          name: formData.name.trim(),
          code: formData.code.toUpperCase().trim(),
          address: formData.address.trim() || null
        })
        .eq('id', station.id);

      if (error) throw error;

      toast({
        title: "Station Updated",
        description: `${formData.name} has been updated successfully`
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update station",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Station</DialogTitle>
          <DialogDescription>Update station information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editStationName">Station Name *</Label>
            <Input
              id="editStationName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Washim"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editStationCode">Station Code *</Label>
            <Input
              id="editStationCode"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., WH"
              maxLength={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editStationAddress">Station Address (Optional)</Label>
            <Input
              id="editStationAddress"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Full postal address"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Station'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StationEditForm;
