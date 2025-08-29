import axios, { AxiosError } from "axios";

export const resolveImageFromURI = (marketURI: string): string | null => {
  try {
    const cid = marketURI?.replace("ipfs://", "");
    if (!cid) return null;
    return `https://ipfs.io/ipfs/${cid}`;
  } catch {
    return null;
  }
};

export const uploadImageToIPFS = async (image: File): Promise<string | null> => {
  if (!image) return null;

  const uploadFormData = new FormData();
  uploadFormData.append("file", image);
  uploadFormData.append("network", "public");

  try {
    const response = await axios.post("https://uploads.pinata.cloud/v3/files", uploadFormData, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      maxBodyLength: Infinity,
    });

    return response?.data?.data?.cid;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Upload to Pinata failed:", error.response?.data || error);
    }
    return null;
  }
};
