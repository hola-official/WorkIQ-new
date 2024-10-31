import { Tooltip } from "@material-tailwind/react";

const StatsCard = ({ imgUrl, value, title }) => {
  return (
    <Tooltip

      className={'border border-blue-gray-50 bg-white px-4 py-2 shadow-xl shadow-black/10'}
      content={
        <div className="text-xs text-black">
          {title}
          <br />
          Expert Freelancer
          <br />
          4+ orders completed.
        </div>
      }
      placement="bottom"
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0, y: 25 },
      }}>
      <div className="light-border background-light900_dark300 flex flex-wrap items-center justify-start gap-4 rounded-md border px-1 py-2 shadow-light-300 dark:shadow-dark-200">
        <img src={imgUrl} alt={title} width={40} height={50} />
        <div>
          <p className="paragraph-semibold text-dark200_light900">{value}</p>
          <p className="body-medium text-dark400_light700">{title}</p>
        </div>
      </div>
    </Tooltip>
  );
};

export default StatsCard