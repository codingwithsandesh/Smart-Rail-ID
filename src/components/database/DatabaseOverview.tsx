
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Database, CheckCircle, XCircle } from 'lucide-react';

interface DatabaseOverviewProps {
  totalRecords: number;
  filledRecords: number;
  emptyRecords: number;
}

const DatabaseOverview = ({ totalRecords, filledRecords, emptyRecords }: DatabaseOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 text-left">Total Records</CardTitle>
          <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalRecords}</div>
          <p className="text-xs text-blue-600 dark:text-blue-400 text-left">Across all tables</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 text-left">Filled Records</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">{filledRecords}</div>
          <p className="text-xs text-green-600 dark:text-green-400 text-left">Records with data</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 text-left">Empty Records</CardTitle>
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">{emptyRecords}</div>
          <p className="text-xs text-red-600 dark:text-red-400 text-left">Empty or null records</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseOverview;
