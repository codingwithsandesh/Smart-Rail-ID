
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface TableStats {
  total: number;
  filled: number;
}

interface DatabaseStats {
  stations: TableStats;
  routes: TableStats;
  trains: TableStats;
  tickets: TableStats;
  staff: TableStats;
  verificationLogs: TableStats;
}

interface TableStatisticsProps {
  databaseStats: DatabaseStats;
}

const TableStatistics = ({ databaseStats }: TableStatisticsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-left">Table Statistics</CardTitle>
        <CardDescription className="text-left">Detailed breakdown of each database table</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(databaseStats).map(([tableName, stats]) => (
            <div key={tableName} className="p-4 border rounded-lg">
              <h3 className="font-medium text-left capitalize">{tableName.replace(/([A-Z])/g, ' $1').trim()}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-left">Total:</span>
                  <span>{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-left">Filled:</span>
                  <span className="text-green-600">{stats.filled}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-left">Empty:</span>
                  <span className="text-red-600">{stats.total - stats.filled}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TableStatistics;
