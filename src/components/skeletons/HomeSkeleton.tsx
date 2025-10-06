import SkeletonBlock from './SkeletonBlock';

const Pill = () => <SkeletonBlock className="h-4 w-32" />;

const HomeSkeleton = () => {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden bg-brand-deep text-white">
        <SkeletonBlock className="h-[520px] w-full" />
      </div>

      <section className="relative -mt-4 py-20 sm:-mt-6">
        <div className="px-0 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[2.75rem] border border-brand-primary/20 bg-white/80 px-6 py-12 shadow-[0_45px_140px_-70px_rgba(12,54,24,0.5)] backdrop-blur">
              <div className="grid gap-10 lg:grid-cols-[1.4fr,0.6fr]">
                <div className="space-y-6">
                  <Pill />
                  <SkeletonBlock className="h-10 w-3/4" />
                  <SkeletonBlock className="h-20 w-full" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <SkeletonBlock key={idx} className="h-16 w-full" />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <SkeletonBlock className="h-11 w-48" />
                    <SkeletonBlock className="h-11 w-48" />
                  </div>
                </div>
                <div className="flex flex-col gap-4 rounded-[2rem] border border-brand-primary/20 bg-white/80 p-6 shadow-inner">
                  <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-4 w-20" />
                    <SkeletonBlock className="h-4 w-16" />
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <SkeletonBlock key={idx} className="h-14 w-full" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative mt-12 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <SkeletonBlock key={idx} className="h-32" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-gxt py-16">
        <div className="space-y-8">
          <SkeletonBlock className="h-10 w-1/3" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonBlock key={idx} className="h-80" />
            ))}
          </div>
        </div>
      </section>

      <section className="container-gxt py-16">
        <SkeletonBlock className="h-10 w-1/3" />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonBlock key={idx} className="h-48" />
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="container-gxt">
          <SkeletonBlock className="h-10 w-1/3" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonBlock key={idx} className="h-40" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-deep py-16 text-white">
        <div className="container-gxt flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="space-y-4">
            <SkeletonBlock className="h-10 w-72" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SkeletonBlock className="h-12 w-48" />
            <SkeletonBlock className="h-12 w-48" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSkeleton;
