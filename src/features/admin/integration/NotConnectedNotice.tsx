import { PlugZap } from "lucide-react"

/**
 * Stage 11: shown in integration mode for admin screens that are not yet wired to the
 * backend. These screens previously rendered fixture records under the "real" mode,
 * which a tester could mistake for school data.
 */
export function NotConnectedNotice({ feature }: { feature: string }) {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <PlugZap className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-gray-950">{feature} is not connected yet</h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        This screen does not show sample data in the secure integration mode. It will display live
        records once it is connected to the school backend.
      </p>
    </section>
  )
}
