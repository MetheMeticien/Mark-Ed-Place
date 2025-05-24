import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>Product {index + 1}</TableCell>
                  <TableCell>Customer {index + 1}</TableCell>
                  <TableCell className="text-right">$100.00</TableCell>
                  <TableCell className="text-right">Completed</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
