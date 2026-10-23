const Container = ({ className }: { className: string }) => {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
    ></div>
  );
};

export default Container;
