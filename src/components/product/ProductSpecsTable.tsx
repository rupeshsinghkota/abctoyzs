import { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ProductSpecsTableProps {
    specs: NonNullable<Product['specs']>;
    additionalInfo?: Record<string, string | number | undefined>;
    className?: string;
}

export function ProductSpecsTable({ specs, additionalInfo, className }: ProductSpecsTableProps) {
    // Merge core specs with any additional info passed
    const rows = [
        { label: "Battery Check", value: specs.battery },
        { label: "Max Speed", value: specs.speed },
        { label: "Max Load Capacity", value: specs.max_load },
        { label: "Mobile App Control", value: specs.mobile_app ? "Yes (iOS & Android)" : "No" },
        // Add potentially missing fields or mapped ones if they exist in the future
        ...(additionalInfo ? Object.entries(additionalInfo).map(([k, v]) => ({ label: k, value: v })) : [])
    ].filter(r => r.value !== undefined);

    return (
        <div className={cn("overflow-hidden rounded-xl border border-border/50", className)}>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 font-semibold tracking-wider">
                    <tr>
                        <th scope="col" className="px-6 py-4">Specification</th>
                        <th scope="col" className="px-6 py-4">Detail</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                    {rows.map((row, index) => (
                        <tr
                            key={row.label}
                            className={cn(
                                "hover:bg-muted/30 transition-colors",
                                index % 2 === 0 ? "bg-background" : "bg-muted/10"
                            )}
                        >
                            <th scope="row" className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                {row.label}
                            </th>
                            <td className="px-6 py-4 text-muted-foreground w-full">
                                {row.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
