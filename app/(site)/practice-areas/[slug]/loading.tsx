import { Skeleton } from "@/components/ui/skeleton";

export default function PracticeAreaLoading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading practice area</span>
      <section className="bg-white pt-14 pb-16 lg:pt-[100px]">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="mt-10 h-4 w-32" />
            <Skeleton className="mt-5 h-20 max-w-[660px]" />
            <Skeleton className="mt-6 h-20 max-w-[640px]" />
            <Skeleton className="mt-8 h-13 w-64" />
          </div>
        </div>
      </section>
      <section className="bg-white pb-[88px] lg:pb-[140px]">
        <div className="container-page">
          <div className="mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-12">
            <div className="grid gap-5 lg:col-span-8 md:grid-cols-2">
              {["one", "two", "three", "four", "five", "six"].map((key) => (
                <Skeleton key={key} className="h-36" />
              ))}
            </div>
            <Skeleton className="h-80 lg:order-last lg:col-span-4" />
          </div>
        </div>
      </section>
    </div>
  );
}
