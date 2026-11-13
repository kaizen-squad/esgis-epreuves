import Image from "next/image";

const ImageHandler = ({
  image_url,
  image_alt,
  className,
}: {
  image_url: string;
  image_alt: string;
  className?: string;
}) => {
  return (
    <div
      className={`relative mx-auto mb-16 h-90 w-full overflow-x-hidden md:h-180 lg:h-200 ${className}`}
    >
      <Image
        src={image_url}
        alt={image_alt}
        fill
        className="object-cover object-top"
        sizes="(max-width: 1200px) 100%"
        loading="eager"
      />
    </div>
  );
};

export default ImageHandler;
