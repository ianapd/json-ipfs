import { Box, Container, Heading, FormControl, FormLabel, Input, Button, Textarea, Link, Text, VStack, Image, Spinner, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, ModalFooter } from "@chakra-ui/react";
import { create } from "ipfs-http-client"
import { useState, useEffect } from "react"

const itemState = {
  item: '',
  description: '',
  royalties: '',
  edition: '',
  price: '',
  file: '',
  properties: []
}

const client = create("https://ipfs.infura.io:5001/api/v0")

export default function Home() {  
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [item, setItem] = useState(itemState)
  const [cid, setCid] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [jsonData, setJsonData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState([])
  const [property, setProperty] = useState([])
  const [gameProperty, setGameProperty] = useState([{
    "property": null,
    "value": null
  }])

  async function onChange ({ target: { name, value, files } }) {
    switch (name) {
      case 'royalties':
        setItem({ ...item, [name]: parseInt(value) })
        break;
      case 'price':
        setItem({ ...item, [name]: parseFloat(value) })
        break;  
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

  function onAddToItem () {
    console.log(property)
    setItem({ ...item, properties: property })
  }

  function onPropertyChange({ target: { name, value } }) {
    setGameProperty({...gameProperty, [name]: value })
    if (gameProperty.property != null && gameProperty.value != null) {
      setProperty([...property, {...gameProperty}])
      setGameProperty([])
    }
  }

  function onRemoveChange(index) {
    const currentProperties = properties
    const currentProperty = property

    setProperties([...currentProperties.slice(0, index) , ...currentProperties.slice(index+1)])
    setProperty([...currentProperty.slice(0, index) , ...currentProperty.slice(index, 1)])
  }

  function onFirstRemoveChange() {
    setGameProperty([])
    setProperty([])
    console.log(gameProperty.property)
    console.log(gameProperty.value)
  }

  async function upload() {
    setIsLoading(true)
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
    console.log(fileUrl)
    try {
      const data = await fetch(fileUrl)
      const json = await data.json()
      setJsonData(json)
      setIsLoading(false)
    } catch (error) {
      console.log('Error getting json data: ', error)
    }  
  }

  useEffect(() => {
    getJsonData(fileUrl)
    console.log(jsonData)
  }, [fileUrl])

  console.log(property)
  console.log(item)

  return (
    <Box pt={16}>
      <Container maxW="container.md">
        <Heading mb={4}>Upload JSON Data to IPFS and get the data</Heading>
        <Heading size="lg" mb={4}>Create an Item</Heading>
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
        <HStack justify="space-between">
          <FormLabel>Properties</FormLabel>
          <Button onClick={onOpen}>Add</Button>
        </HStack> 
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Property</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={4}>Add property for your item</Text>
              <HStack spacing={8} align="start">
                <FormControl mb={4}>
                  <FormLabel>Property</FormLabel>
                  <Input name="property" value={gameProperty.property} onChange={onPropertyChange} />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Value</FormLabel>
                  <Input name="value" value={gameProperty.value} onChange={onPropertyChange} />
                </FormControl>
                <Button onClick={() => onFirstRemoveChange()}>Del</Button>
              </HStack>
              {
                properties.map((p, index) => (
                  <HStack key={index} spacing={8} align="start">
                    <FormControl mb={4}>
                      <FormLabel>Property</FormLabel>
                      <Input name="property" onChange={onPropertyChange} />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>Value</FormLabel>
                      <Input name="value" onChange={onPropertyChange} />
                    </FormControl>
                    <Button onClick={() => onRemoveChange(index)}>Del</Button>
                  </HStack>
                ))
              }
              <Button mb={4} onClick={() => {
                setProperties([...properties, `p${properties.length + 1}`])
                setGameProperty([])
              }}>Add</Button>
            </ModalBody>

            <ModalFooter>
              <Button variant='ghost' onClick={() => {
                onAddToItem()
                onClose()
                setProperties([])
              }}>Save</Button>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <VStack spacing={4} align="start">
          <Button onClick={upload} mb={4}>Upload to IPFS</Button>
          {
            isLoading && <Spinner />
          }
        </VStack>
        {
          jsonData ? (
            <VStack align="start" spacing={2} mb={8}>
              <Heading size="md" my={4}>Data from JSON</Heading>
              <Image src={jsonData.file} boxSize="200px" />
              <Text>Cid: {cid}</Text>
              <Text>Item Name: {jsonData.item}</Text>
              <Text>Description: {jsonData.description}</Text>
              <Text>Royalties: {jsonData.royalties}</Text>
              <Text>Edition: {jsonData.edition}</Text>
              <Text>Price: {jsonData.price}</Text>
              <Text>Properties</Text>
              {
                jsonData.properties.map((data, dataKey) => (
                  <VStack key={dataKey} align="start" spacing={2}>
                    <Text>Property: {data.property}</Text>
                    <Text>Value: {data.value}</Text>
                  </VStack>
                ))
              }
              {
                fileUrl && (
                  <Link mb={2} as="a" href={fileUrl} target="_blank">
                    <Button>Get the link</Button>
                  </Link>
                )
              }
            </VStack>
          ) : null
        }  
      </Container>  
    </Box>
  )
}
