import { FC } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";

interface loadingProps {}

const loading: FC<loadingProps> = ({}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <Skeleton className="mb-4" width={500} height={60} />
      <Skeleton width={350} height={50} />
      <Skeleton width={350} height={50} />
      <Skeleton width={350} height={50} />
    </div>
  );
};

export default loading;
