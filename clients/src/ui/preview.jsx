import React, { Suspense } from "react";
import "react-quill/dist/quill.bubble.css";

const Preview = ({ value }) => {
  const ReactQuill = React.lazy(() => import("react-quill"));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactQuill theme="bubble" value={value} readOnly />
    </Suspense>
  );
};

export default Preview;