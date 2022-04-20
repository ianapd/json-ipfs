import { Box, Container, Heading, FormControl, FormLabel, Input, Button, Textarea, Link, Text, VStack, Image } from "@chakra-ui/react";
import { create } from "ipfs-http-client"
import { useState, useEffect } from "react";

const itemState = {
  item: '',
  description: '',
  royalties: '',
  edition: '',
  price: ''
}

const client = create("https://ipfs.infura.io:5001/api/v0")

export default function Form () {
  const [item, setItem] = useState(itemState)
  const [cid, setCid] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [jsonData, setJsonData] = useState([])

  async function onChange ({ target: { name, value, files } }) {
    switch (name) {
      case 'edition':
        setItem({ ...item, [name]: `1/${value}` })
        break;
      case 'file':
        const file = files[0]
        console.log(file)
        try {
          const added = await client.add(file)
          const url = `https://cloudflare-ipfs.com/ipfs/${added.path}`
          console.log(added)
          console.log("cid: " + added.cid)
          console.log("url: " + url)
          setItem({ ...item, [name]: url })
        } catch (error) {
          console.log('Error uploading file: ', error)
        }  
        break;  
      default:
        setItem({ ...item, [name]: value })
        break;
    }
  }

  async function upload() {
    const jsonData = JSON.stringify(item)
    try {
      const added = await client.add(jsonData)
      const url = `https://cloudflare-ipfs.com/ipfs/${added.path}`
      console.log(added)
      console.log("cid: " + added.cid)
      console.log("url: " + url)
      setCid(added.path)
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function getJsonData(fileUrl) {
    try {
      const data = await fetch(fileUrl)
      const json = await data.json()
      setJsonData(json)
    } catch (error) {
      console.log('Error getting json data: ', error)
    }  
  }

  useEffect(() => {
    getJsonData(fileUrl)
  }, [fileUrl])

  return (
    <Box pt={16}>
      <Container maxW="container.md">
        <Heading mb={4}>Create an Item</Heading>
        <FormControl mb={4}>
          <FormLabel>Upload MP3, MP4, JPG AND PNG</FormLabel>
          <Input name="file" type="file" onChange={onChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Item Name</FormLabel>
          <Input name="item" onChange={onChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Description</FormLabel>
          <Textarea name="description" onChange={onChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Royalties</FormLabel>
          <Input type="number" name="royalties" onChange={onChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Edition</FormLabel>
          <Input type="number" name="edition" onChange={onChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Price</FormLabel>
          <Input type="number" name="price" onChange={onChange} />
        </FormControl>
        <Button onClick={upload} mb={4}>Upload to IPFS</Button>
        <VStack align="start" spacing={0}>
          {
            fileUrl && (
              <Link mb={4} as="a" href={fileUrl} target="_blank">
                Go to the link of json metadata
              </Link>
            )
          }
          {
            cid && (
              <Text mb={4}>Cid: {cid}</Text>
            )
          }
        </VStack>
        <Heading size="md" mb={4}>Data from JSON</Heading>
        {
          jsonData && (
            <VStack align="start" spacing={0}>
              <Image mb={4} src={jsonData.file} />
              <Text>Item Name: {jsonData.item}</Text>
              <Text>Description: {jsonData.description}</Text>
              <Text>Royalties: {jsonData.royalties}</Text>
              <Text>Edition: {jsonData.edition}</Text>
              <Text>Price: {jsonData.price}</Text>
            </VStack>
          )
        }  
      </Container>  
    </Box>
  )
}