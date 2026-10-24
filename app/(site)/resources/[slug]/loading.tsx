import { Skeleton } from "@/components/ui/skeleton";

export default function GuideLoading() {
  return (
    <div aria-busy="true" className="bg-white pt-14 pb-20 lg:pt-[100px]">
      <span className="sr-only">Loading guide</span>
      <div className="container-page">
        <div className="mx-auto max-w-[1200px]">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="mt-10 h-4 w-32" />
          <Skeleton className="mt-5 h-16 w-4/5" />
          <Skeleton className="mt-8 h-11 w-60" />
          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Skeleton className="h-40 lg:col-span-3" />
            <div className="flex flex-col gap-4 lg:col-span-9">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
