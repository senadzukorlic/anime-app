// Components/Manga/Manga.jsx
import React, { useContext, useState, useCallback, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AnimeData } from "../../Context/Anime";
import { AnimeCard, AnimeStyled, TextHolder, Text } from "./MangaStyled"; // Ensure the MangaStyled components are correctly imported
import axios from "axios";
import { throttle } from "lodash";
import CategorySelector from "../../Components/CategorySearchInput/CategorySearchInput";
import Loader from "../../Components/Loader/loader";
import SearchInput from "../../Components/search/input";
import { Container, Typography } from "@mui/material";
import Info from "../../Components/InfoPopUp/Info"; // Import Info component

export default function Manga() {
  const { mangaData, setMangaData } = useContext(AnimeData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManga, setSelectedManga] = useState(null); // State for selected manga
  const [infoOpen, setInfoOpen] = useState(false); // State for Info component visibility

  const fetchMoreData = useCallback(
    throttle(async () => {
      try {
        const response = await axios.get(
          `https://kitsu.io/api/edge/manga?page[limit]=10&page[offset]=${
            page * 10
          }${
            selectedCategory ? `&filter[categories]=${selectedCategory}` : ""
          }${searchQuery ? `&filter[text]=${searchQuery}` : ""}`,
          {
            headers: {
              Accept: "application/vnd.api+json",
            },
          }
        );
        const newMangaData = response.data.data;
        if (newMangaData.length === 0) {
          setHasMore(false);
        } else {
          setMangaData((prevMangaData) => [...prevMangaData, ...newMangaData]);
          setPage((prevPage) => prevPage + 1);
        }
      } catch (error) {
        console.error("Error fetching more manga data:", error);
      }
    }, 500), // Throttle to 500ms
    [page, selectedCategory, searchQuery, setMangaData]
  );

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setMangaData([]);
    setPage(1);
    setHasMore(true);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setMangaData([]);
    setPage(1);
    setHasMore(true);
  };

  const handleCardClick = (manga) => {
    setSelectedManga(manga);
    setInfoOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoOpen(false);
    setSelectedManga(null);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(
          `https://kitsu.io/api/edge/manga?page[limit]=10${
            selectedCategory ? `&filter[categories]=${selectedCategory}` : ""
          }${searchQuery ? `&filter[text]=${searchQuery}` : ""}`,
          {
            headers: {
              Accept: "application/vnd.api+json",
            },
          }
        );
        setMangaData(response.data.data);
      } catch (error) {
        console.error("Error fetching initial manga data:", error);
      }
    };

    fetchInitialData();
  }, [selectedCategory, searchQuery, setMangaData]);

  return (
    <Container style={{ marginLeft: "15%", marginRight: "20%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <CategorySelector
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        <SearchInput
          valueProp={searchQuery}
          onChangeProp={handleSearchChange}
        />
      </div>
      <hr style={{ marginTop: "10px" }} />
      {mangaData.length > 0 ? (
        <InfiniteScroll
          dataLength={mangaData.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<Loader />}
          endMessage={<p>No more manga to load</p>}
        >
          <AnimeStyled>
            {mangaData.map((manga) => (
              <AnimeCard
                key={manga.id}
                style={{
                  backgroundImage: `url(${manga.attributes?.posterImage?.large})`,
                }}
                onClick={() => handleCardClick(manga)} // Add onClick event
              >
                <TextHolder>
                  <Text>{manga.attributes?.canonicalTitle || "No Title"}</Text>
                </TextHolder>
              </AnimeCard>
            ))}
          </AnimeStyled>
        </InfiniteScroll>
      ) : (
        <Loader />
      )}
      <Info
        open={infoOpen}
        handleClose={handleCloseInfo}
        anime={selectedManga}
      />
    </Container>
  );
}
