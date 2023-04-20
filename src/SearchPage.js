import React, { useState, useEffect } from "react";
import { MongoClient } from "mongodb";
import {
  Container,
  Form,
  FormControl,
  Button,
  Row,
  Col,
  Card
} from "react-bootstrap";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const client = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    async function fetchData() {
      try {
        await client.connect();
        const db = client.db(process.env.MONGO_DB);
        const collection = db.collection("ads");
        const regex = new RegExp(searchTerm, "i");

        const results = await collection
          .aggregate([
            {
              $match: {
                $or: [
                  { company: { $regex: regex } },
                  { primaryText: { $regex: regex } },
                  { headline: { $regex: regex } },
                  { description: { $regex: regex } }
                ]
              }
            },
            { $unwind: "$ads" }
          ])
          .toArray();

        setAds(results);
      } catch (error) {
        console.log(error);
      } finally {
        await client.close();
      }
    }

    fetchData();
  }, [searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Container>
      <h1>Search Ads</h1>
      <Form>
        <Row className="mb-3">
          <Col xs={9}>
            <FormControl
              type="text"
              placeholder="Enter search term"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Col>
          <Col xs={3}>
            <Button variant="primary" type="submit">
              Search
            </Button>
          </Col>
        </Row>
      </Form>
      <Row xs={1} md={2} lg={3} className="g-4">
        {ads.map((ad) => (
          <Col key={ad._id}>
            <Card>
              <Card.Img
                variant="top"
                src={ad.ads.imageURL}
                alt={ad.ads.headline}
              />
              <Card.Body>
                <Card.Title>{ad.ads.headline}</Card.Title>
                <Card.Text>{ad.ads.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SearchPage;
