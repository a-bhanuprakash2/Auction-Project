
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bid } from '@/types';

interface BiddingHistoryProps {
  bids: Bid[];
  maxHeight?: string;
}

const BiddingHistory: React.FC<BiddingHistoryProps> = ({ bids, maxHeight = "400px" }) => {
  // Sort bids by timestamp descending
  const sortedBids = [...bids].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (bids.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">No bids placed yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full" style={{ maxHeight }}>
      <div className="space-y-4">
        {sortedBids.map((bid) => (
          <div 
            key={bid.id} 
            className="flex items-center justify-between bg-muted/30 p-3 rounded-md"
          >
            <div>
              <p className="font-medium">{bid.bidderName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">${bid.amount.toLocaleString()}</span>
              {bid.isCollaborative && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  Group
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default BiddingHistory;
