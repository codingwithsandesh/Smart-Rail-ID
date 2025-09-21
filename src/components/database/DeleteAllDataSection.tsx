
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteAllDataSectionProps {
  isDeletingAll: boolean;
  handleDeleteAllData: () => void;
}

const DeleteAllDataSection = ({ isDeletingAll, handleDeleteAllData }: DeleteAllDataSectionProps) => {
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-left">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-left">
          Permanently delete all tickets and verification logs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200 text-left">
            <strong>Warning:</strong> This action will permanently delete all tickets and verification logs from the database. This cannot be undone!
          </p>
        </div>
        
        <Button
          onClick={handleDeleteAllData}
          disabled={isDeletingAll}
          variant="destructive"
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeletingAll ? 'Deleting All Data...' : 'Delete All Data'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeleteAllDataSection;
