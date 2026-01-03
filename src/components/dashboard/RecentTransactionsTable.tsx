import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "credit" | "debit";
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  hasData: boolean;
}

const formatCurrency = (amount: number): string => {
  return `₨ ${Math.abs(amount).toLocaleString()}`;
};

const sampleTransactions: Transaction[] = [
  { date: "2024-01-15", description: "Client Payment - ABC Corp", category: "Sales", amount: 150000, type: "credit" },
  { date: "2024-01-14", description: "Office Rent", category: "Rent", amount: 45000, type: "debit" },
  { date: "2024-01-13", description: "Inventory Purchase", category: "Inventory", amount: 78000, type: "debit" },
  { date: "2024-01-12", description: "Service Revenue", category: "Services", amount: 85000, type: "credit" },
  { date: "2024-01-10", description: "Utility Bill", category: "Utilities", amount: 12000, type: "debit" },
];

const RecentTransactionsTable = ({ transactions, hasData }: RecentTransactionsTableProps) => {
  const displayTransactions = hasData && transactions.length > 0 ? transactions.slice(0, 5) : sampleTransactions;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">
          {hasData ? "Latest activity from your documents" : "Sample transactions"}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground">Date</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Description</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Category</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTransactions.map((transaction, index) => (
              <TableRow key={index} className="hover:bg-muted/30">
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString("en-NP", { 
                    month: "short", 
                    day: "numeric" 
                  })}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {transaction.type === "credit" ? (
                      <ArrowUpRight className="w-3 h-3 text-success" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`text-sm font-medium ${
                      transaction.type === "credit" ? "text-success" : "text-destructive"
                    }`}>
                      {transaction.type === "credit" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
