import { format } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Banknote,
  Handshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketplaceInvitation, Lender } from "@/hooks/use-market-place";
import { cn } from "@/lib/utils";

interface InvitationCardProps {
  invitation: MarketplaceInvitation;
  lender?: Lender;
  onAccept?: () => void;
  onReject?: () => void;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle,
  },
  rejected: {
    label: "Declined",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-muted text-muted-foreground",
    icon: Clock,
  },
};

export function InvitationCard({
  invitation,
  lender,
  onAccept,
  onReject,
}: InvitationCardProps) {
  const status = statusConfig[invitation.status];
  const StatusIcon = status.icon;
  const isLoan = invitation.invitation_type === "loan";

  return (
    <Card
      className={cn(
        "border-border/50 transition-all duration-200",
        invitation.status === "pending" && "hover:border-primary/30"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "p-2.5 rounded-lg",
              isLoan ? "bg-blue-500/10" : "bg-purple-500/10"
            )}
          >
            {isLoan ? (
              <Banknote className="h-5 w-5 text-blue-500" />
            ) : (
              <Handshake className="h-5 w-5 text-purple-500" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">
                {isLoan ? "Loan Invitation" : "Partnership Invitation"}
              </h4>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Building2 className="h-3 w-3" />
              <span>{lender?.name || "Unknown Lender"}</span>
              <span>•</span>
              <span>
                {format(new Date(invitation.created_at), "MMM d, yyyy")}
              </span>
            </div>

            {invitation.message && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                "{invitation.message}"
              </p>
            )}

            {invitation.offer_details &&
              Object.keys(invitation.offer_details).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Object.entries(invitation.offer_details).map(
                    ([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key.replace(/_/g, " ")}: {String(value)}
                      </Badge>
                    )
                  )}
                </div>
              )}

            {invitation.expires_at && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires:{" "}
                {format(new Date(invitation.expires_at), "MMM d, yyyy")}
              </p>
            )}
          </div>

          {/* Actions */}
          {invitation.status === "pending" && (
            <div className="flex-shrink-0 flex gap-2">
              <Button size="sm" variant="outline" onClick={onReject}>
                Decline
              </Button>
              <Button size="sm" onClick={onAccept}>
                Accept
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
