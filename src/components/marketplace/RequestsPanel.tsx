import { format } from "date-fns";
import {
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Banknote,
  Handshake,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MarketplaceRequest,
  MarketplaceInvitation,
  Lender,
} from "@/hooks/use-market-place";
import { cn } from "@/lib/utils";

interface RequestsPanelProps {
  requests: MarketplaceRequest[];
  invitations: MarketplaceInvitation[];
  lenders: Lender[];
  onViewRequest?: (request: MarketplaceRequest) => void;
  onAcceptInvitation?: (invitation: MarketplaceInvitation) => void;
  onRejectInvitation?: (invitation: MarketplaceInvitation) => void;
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
    label: "Rejected",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-muted text-muted-foreground",
    icon: Clock,
  },
};

export function RequestsPanel({
  requests,
  invitations,
  lenders,
  onViewRequest,
  onAcceptInvitation,
  onRejectInvitation,
}: RequestsPanelProps) {
  const getLenderName = (lenderId: string) => {
    return lenders.find((l) => l.id === lenderId)?.name || "Unknown Lender";
  };

  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  return (
    <div className="space-y-4">
      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-500" />
              Pending Invitations ({pendingInvitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-3 rounded-lg bg-background border border-border/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      invitation.invitation_type === "loan"
                        ? "bg-blue-500/10"
                        : "bg-purple-500/10"
                    )}
                  >
                    {invitation.invitation_type === "loan" ? (
                      <Banknote className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Handshake className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {invitation.invitation_type === "loan"
                        ? "Loan"
                        : "Partnership"}{" "}
                      Invitation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      From {getLenderName(invitation.lender_id)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRejectInvitation?.(invitation)}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onAcceptInvitation?.(invitation)}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* My Requests */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Send className="h-4 w-4" />
            My Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No requests yet. Apply to a lender to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => {
                const status = statusConfig[request.status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={request.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors cursor-pointer"
                    onClick={() => onViewRequest?.(request)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            request.request_type === "loan"
                              ? "bg-blue-500/10"
                              : "bg-purple-500/10"
                          )}
                        >
                          {request.request_type === "loan" ? (
                            <Banknote className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Handshake className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {request.request_type === "loan"
                                ? "Loan Request"
                                : "Partnership Request"}
                            </p>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>{getLenderName(request.lender_id)}</span>
                            <span>•</span>
                            <span>
                              {format(
                                new Date(request.created_at),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {request.lender_response && (
                      <p className="mt-2 text-xs text-muted-foreground pl-11">
                        Response: "{request.lender_response}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
