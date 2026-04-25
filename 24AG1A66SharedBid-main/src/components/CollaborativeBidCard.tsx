
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CollaborativeBid, Product } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CollaborativeBidCardProps {
  product: Product;
  collaborativeBid: CollaborativeBid;
  onJoin?: () => void;
}

const CollaborativeBidCard: React.FC<CollaborativeBidCardProps> = ({ 
  product, 
  collaborativeBid,
  onJoin
}) => {
  const { currentUser } = useAuth();
  const percentageFunded = Math.round((collaborativeBid.totalAmount / product.currentBid) * 100);
  const isParticipant = currentUser ? 
    collaborativeBid.participants.some(p => p.userId === currentUser.id) : 
    false;
  
  const remainingAmount = product.currentBid - collaborativeBid.totalAmount;
  
  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <span className="mr-2">Collaborative Bidding</span>
          <Badge 
            className="text-xs px-2 py-0 h-5 bg-purple-100 text-purple-800 border border-purple-200"
          >
            {collaborativeBid.status}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Join forces with others to bid on this high-value item
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">{percentageFunded}%</span>
        </div>
        <Progress value={percentageFunded} className="h-2" />
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Contributed</span>
            <span className="font-medium">${collaborativeBid.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Target Amount</span>
            <span className="font-medium">${product.currentBid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Still Needed</span>
            <span className="font-medium text-purple-700">${remainingAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Participants</span>
            <span className="font-medium">{collaborativeBid.participantCount}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex -space-x-2 overflow-hidden justify-center">
            {collaborativeBid.participants.slice(0, 5).map((participant, i) => (
              <Avatar key={participant.userId} className="border-2 border-white w-8 h-8">
                <AvatarImage src={`https://i.pravatar.cc/100?u=${participant.userId}`} />
                <AvatarFallback>{participant.userName[0]}</AvatarFallback>
              </Avatar>
            ))}
            {collaborativeBid.participants.length > 5 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-muted text-xs">
                +{collaborativeBid.participants.length - 5}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isParticipant ? (
          <div className="w-full text-center">
            <p className="text-sm text-green-600 font-medium">You're participating</p>
            <p className="text-xs text-muted-foreground">
              Joined {formatDistanceToNow(
                new Date(collaborativeBid.participants.find(p => p.userId === currentUser?.id)?.joinedAt || ''),
                { addSuffix: true }
              )}
            </p>
          </div>
        ) : (
          <Button className="w-full" onClick={onJoin}>Join Collaborative Bid</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CollaborativeBidCard;

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className }) => (
  <span className={`rounded-full inline-block ${className}`}>
    {children}
  </span>
);
