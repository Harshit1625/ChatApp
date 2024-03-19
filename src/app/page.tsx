import Button from "@/components/ui/Button";
import { db } from "@/lib/db";
import { FC } from "react";

interface pageProps {}

const Home: FC<pageProps> = async ({}) => {
 
  return <Button isLoading={false}>hello</Button>
};

export default Home;
