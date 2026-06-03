import { useCachedImage } from "./UI/images";

function Avatar({ url }) {
  const { src, loading, error } = useCachedImage(url);

    console.log("src",src)
    console.log("loading",loading)
    console.log("error",error)

  if (loading) return <div>Loading...</div>;
  if (error || !src) return <div>No image</div>;

  return <img src={src} alt="" />;
}


export const AvTest = () =>{

    const url = 'http://192.168.2.2:9000/avatar/ea4086dd1ec9a9baeff9af843dba75a0.jpg'
    return <Avatar url={url}/>
}