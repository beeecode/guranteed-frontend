import { Database } from "lucide-react"

/** Stage 11: sample (fixture) data has been removed; admin screens show live data only. */
export function PreviewDataRemoved({ feature }: { feature: string }) {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#B22234]">
        <Database className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-gray-950">{feature} shows live data only</h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        Sample records have been removed. Run the portal in integration mode, connected to the
        school backend, to manage real records.
      </p>
    </section>
  )
}
