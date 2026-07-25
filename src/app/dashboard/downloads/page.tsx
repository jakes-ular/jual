import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui/states";
import { DownloadCloud } from "lucide-react";

export default async function DownloadsPage() {
  const session = await getServerSession(authOptions);

  const downloads = await prisma.download.findMany({
    where: { userId: session!.user.id },
    include: { productFile: { include: { product: { select: { name: true, slug: true } } } } },
    orderBy: { downloadedAt: "desc" },
    take: 50,
  });

  if (downloads.length === 0) {
    return (
      <EmptyState
        icon={DownloadCloud}
        title="Belum ada riwayat download"
        description="Riwayat file yang Anda unduh akan tercatat di sini."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-2 uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">Produk</th>
            <th className="px-4 py-3 font-medium">File</th>
            <th className="px-4 py-3 font-medium">Waktu Unduh</th>
          </tr>
        </thead>
        <tbody>
          {downloads.map((d) => (
            <tr key={d.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">{d.productFile.product.name}</td>
              <td className="px-4 py-3 text-muted">{d.productFile.fileName}</td>
              <td className="px-4 py-3 text-muted-2">{formatDateTime(d.downloadedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
