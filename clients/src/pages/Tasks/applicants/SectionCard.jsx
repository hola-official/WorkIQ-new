import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Typography,
} from "@material-tailwind/react";
import { formatPrice } from "@/lib/format";
import { IoTimeOutline, IoDocumentAttachOutline } from "react-icons/io5";
import useAuth from "@/hooks/useAuth";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Icon,
} from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

const SectionCard = ({taskId, section}) => {
  const { username } = useAuth();
  // const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDownload = (url, filename) => {
    try {
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.blob();
        })
        .then((blob) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("Error downloading file:", error);
        });
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  function downloadFile(url, filename) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (xhr.status === 200) {
        // Create a blob URL for the file
        let blob = new Blob([xhr.response], {
          type: xhr.getResponseHeader("Content-Type"),
        });
        let url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element
        let link = document.createElement("a");
        link.href = url;
        link.download = filename;

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      } else {
        alert("Failed to download file. Status: " + xhr.status);
      }
    };
    xhr.onerror = function () {
      alert("Failed to download file.");
    };
    xhr.send();
  }
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const renderAttachments = () => {
    return (
      <ul className="list-none list-inside mb-2">
        {section.attachments.map((attachment, index) => (
          <li key={index} className="flex items-center">
            <IoDocumentAttachOutline
              className="text-blue-400 mr-1 cursor-pointer"
              onClick={() => downloadFile(attachment.url, attachment.name)}
            />
            {attachment.name}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="hover:bg-gray-100 transition overflow-hidden">
      {/* Card Header */}
      <CardHeader
        floated={false}
        shadow={true}
        color="transparent"
        className="m-0 h-50 md:h-50 rounded-none"
      ></CardHeader>
      {/* Card Body */}
      <CardBody className="p-3">
        {/* Section Title */}
        <Typography
          variant="h6"
          className="text-lg md:text-2xl two-line-truncate"
          color="blue-gray"
        >
          {section.title}
        </Typography>
        <div className="text-base md:text-lg">{section.description}</div>
        {/* Attachments */}
        {section.attachments && section.attachments.length > 0 && (
          <div className="mt-2 ">
            {section.attachments.length > 1 ? (
              <>
                {/* <Button onClick={toggleModal}>See More</Button>
                 */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={toggleModal}>
                  <Typography variant="subtitle2" color="gray">
                    Attachments:
                  </Typography>
                  <Icon as={AttachmentIcon} />
                </div>

                <Modal isOpen={isOpen} onClose={toggleModal}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Attachments</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{renderAttachments()}</ModalBody>
                    <ModalFooter>
                      <Button colorScheme="blue" onClick={toggleModal}>
                        Close
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </>
            ) : (
              renderAttachments()
            )}
          </div>
        )}
      </CardBody>
      {/* Card Footer */}
      <CardFooter className="p-3">
        <div className="my-2 flex items-center gap-x-2 text-sm md:text-xs">
          <div className="flex items-center gap-x-1 text-slate-500">
            {/* Proposals Length */}
            {/* You can replace proposalsLength with any relevant information */}
            {/* <IconBadge size="sm" icon={BookOpen} /> */}
            <span>
              {section.proposal.length}{" "}
              {section.proposal.lengthh === 1 ? "Proposals" : "Proposal"}
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-1 items-center">
            {/* Ratings */}
            {/* You can replace the ratings with any relevant information */}
            <IoTimeOutline className="text-blue-400" />
            <p className="text-xs text-muted-foreground">
              {section.durationDays} Days
            </p>
          </div>
          {/* Section Price */}
          <p className="text-lg md:text-md font-medium text-slate-700">
            {section.price ? formatPrice(section.price) : "Free"}
          </p>
          <Link to={`/projects/apply/${taskId}/section/${section._id}`}><Button colorScheme={"blue"}>Apply</Button></Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SectionCard;
