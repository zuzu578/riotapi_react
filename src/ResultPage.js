import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api_key from './Apikey'; // api key 
import { useHistory,useParams } from 'react-router'; // getParameter 


 /**
   * 소환사의 데이터 정보를 가져옵니다. 
   * @param {}  
   * @returns 
   */
function GetData(props) {
    //window.location.reload();
   // let {summonerName} = useParams(); // requestParameter 
   // console.log('summonerName =>' , summonerName);
    var summonerName = props.summonerName;
    console.log('nowSummonerName',summonerName)

    //console.log(summonerName);
   // 검색한 소환사의 데이터를 저장하는 state 
   const [loading, setLoading] = useState(false);
   let [summonerData , setSummonerData] = useState(null);
   let summonerObj = []
   //let id = '';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setSummonerData(null);
        const response = await axios.get('https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+summonerName+'',{
            params:{
             api_key: api_key,
            }
          })
          setSummonerData(response.data.name);
          console.log(response)
       
      } catch (e) {
        console.log(e);
      }
   
    };

    fetchUsers();
  }, []);


 summonerObj = summonerData; 

 console.log('summonerData => ',summonerData);


  return (
 
    <div>
             <h1>결과 </h1>
     
        
        {summonerData}
        </div>

 

   
  );

}

export default GetData;