import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const StudentInfo = () => {
  const { id } = useParams();
  const [ data, setData ] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await axios.get("https://localhost:3000/users");
        setData(fetchedData);
      } catch (error) {
        setData(error.message);
      }
    }
    fetchData();
  }, []);

  return (
      <div>
        <h1>Student Info</h1>
        <h2>{`Student ID: ${id}`}</h2>
        <h3>{data}</h3>
      </div>
  );
}