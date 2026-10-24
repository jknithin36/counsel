import { Skeleton } from "@/components/ui/skeleton";

export default function AttorneyProfileLoading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading attorney profile</span>
      <section className="bg-white pt-14 pb-20 lg:pt-[100px] lg:pb-28">
        <div className="container-page">
          <div className="mx-auto max-w-[1200px]">
            <Skeleton className="h-4 w-64" />
            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
              <Skeleton className="aspect-[4/5] lg:col-span-5" />
              <div className="lg:col-span-7 lg:pt-5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-5 h-20 w-4/5" />
                <Skeleton className="mt-8 h-28 w-full" />
                <Skeleton className="mt-8 h-13 w-72" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
