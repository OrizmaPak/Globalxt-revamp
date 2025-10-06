import clsx from 'clsx';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      'relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
      'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
      className
    )}
  />
);

export default SkeletonBlock;
