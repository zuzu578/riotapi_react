import './App.css';
import { InputGroup,FormControl,Nav,NavDropdown,Button} from 'react-bootstrap';
import { useState,useEffect } from 'react';
import axios from 'axios'; 
import api_key from './Apikey'; // api key 
import GetData from './ResultPage.js';
import {Link , Route } from 'react-router-dom';



function App() {
  
  
  // 검색한 소환사의 이름을 저장하는 state 
  let [summonerName , setSummonerName] = useState(null);
 
  // 검색한 소환사의 정보를 가져옵니다.
  let[getUserInfo , setUserInfo] = useState(null);

  
  // 검색한 소환사의 랭크정보를 가져옵니다.
  let[getUserRank , setUserRank] = useState(null);

  //검색한 소환사의 매치 id list 를 가져옵니다.
  let[getMatchIdList , setMatchIdList] = useState(null);
 
  let[revDate , setRevDate] = useState(null);

  // 검색한 소환사의 전적에서 참가한 소환사들의 정보 ( kda , 챔피언 , 아이템정보 등을 저장합니다 .)
  let[getSummonInfo , SetSummonInfo] = useState(null);
  
  // 모달창의 상태 여부 state
  let [modalStatus,setModalStatus] = useState(false);
  
  

  const PromiseArr = [];
  
 /**
  *  소환사의 이름을 input 에서 받아옵니다. 
  * @param {*} e 
  */
  const GetSummonerName = (e) =>{
  
    setSummonerName(e.target.value);
  }

/**
 * 
 * @param {*} e 
 * @returns 
 * @description
 * 사용자가 검색버튼을 누르면 해당 검색창의 parameter를 이용하여 데이터를 fetch 합니다. 그후 모달창을 띄웁니다.
 */
   async function ChangeStatus(e){
    console.log("처음 1");
  
    if(!summonerName){
      alert('소환사 이름을 입력해주세요!');
      return false;
    }
       /**
        * @param summonerName 
        * @description 
        * 소환사의 기본정보를 소환사의 이름 , api_key 를 이용하여 데이터를 가져옵니다.
        */
       const response = await axios.get('https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+summonerName+'',{
              params:{
               api_key: api_key,
              }
            })
           // console.log('resdata ! => 1 ',response.data);
            setUserInfo(response.data);
  
            var convertingDate = new Date(response.data.revisionDate);
            var date = convertingDate;
            //console.log(date);
            setRevDate(date);

            console.log("setUserInfo() set State 2 ");
        /**
         * @param encrytedSummonerId 
         * @description
         * 소환사의 랭크(리그) 정보를 소환사의 암호화된 id 를 이용하여 데이터를 가져옵니다.
         */  
            //console.log("id !!! => " + id);
            const response2 = await axios.get('https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/'+response.data.id+'',{
                params:{
                  api_key: api_key,
                }
              })
              //console.log('resdata ! => 2',response2.data);
              for(var i = 0 ; i < Object.keys(response2.data).length;i++){
              
                setUserRank(response2.data[i]);
              }
              console.log("setUserRank() set State 3 ");

            /**
             * @param puuId
             * @description 
             * puuId 를 이용하여 소환사의 매치ids 를 가져옵니다.
             * 
             */
            // console.log("user PuuId => " ,response.data.puuid );
             const response3 = await axios.get('https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/'+response.data.puuid+'/ids?start=0&count=5',{
              params:{
                api_key: api_key,
              }
            })
          
            setMatchIdList(response3.data);
            console.log("setMatchIdList() set State  4");
           
           
           /**
            * @param matchIdList 
            * @desc puuId 를 이용하여 매치 id 정보들을 가져온 list 를 반복문을 이용하여 매치 상세 정보를 가져옵니다. 
            */

            const response4 = await axios.get('https://asia.api.riotgames.com/lol/match/v5/matches/'+response3.data[i]+'',{
              params:{
                api_key: api_key,
              }
            })
            // for loop 안에서 비동기 (axios통신등 )을 할때는 promise.all 을 사용합니다.
            let users = [];
        
            let promises = [];
            for (i = 0; i < response3.data.length; i++) {
              promises.push(
                axios.get('https://asia.api.riotgames.com/lol/match/v5/matches/'+response3.data[i]+'',{
                params:{
                  api_key: api_key,
                }
              })
                .then(response => {
                  // do something with response
                  users.push(response);
                  
               
               
                })
              )
         
            }
            
            
           // SetSummonInfo(users)

            console.log("promise all 6");       
          // 데이터를 가져오고 모달창을 켭니다. 
          console.log("모달 상태 true 7");
          if(modalStatus === false){
            console.log("모달상태 true 로 변경 ")
            setModalStatus(true);
           
          }
          console.log("전적 데이터 리스트 for loop axios 5");
          Promise.all(promises).then(()=>{ SetSummonInfo(users)})

          
  }

  /**
   * 가져온 소환사의 정보를 rendering 해줍니다. ( Modal status === true 일 경우에 동작 )
   * @returns 
   */
  const GetRendering  = ()=> { 
   
   console.log(getSummonInfo);
   console.log("데이터 렌더링 8 ");
  
  // getMatchIdList2();
  
   
    
        

    
    return(
      <div className="renderingSummonerInfo">
        <h1>
          <div className="image_box">

          <img src={'https://opgg-static.akamaized.net/images/profile_icons/profileIcon'+getUserInfo.profileIconId+'.jpg?image=q_auto:best&v=1518361200'} alt=""/>
          {getUserInfo.name}(Lv:{getUserInfo.summonerLevel})   
        
          </div>
           </h1>
           
        
        <div>최근전적검색 : {getUserInfo.revisionDate} </div>


        <div>  </div>

  
       
        <div className="rankArea"><img src={'https://opgg-static.akamaized.net/images/medals/'+getUserRank.tier+'_1.png?image=q_auto:best&v=1'}/> 
        <span className="tier">{getUserRank.tier} {getUserRank.rank}</span>
        <div> {getUserRank.queueType}</div>
        {getUserRank.leaguePoints}LP / 승: {getUserRank.wins} 패 : {getUserRank.losses}</div>
     
   

        <div>
         
       


        </div>
        
        

        
        
      
      </div>
    )
  }
    

 
  return (
    <div className="App">
      <div className="container">
      <div className="row">
        <div className="banner_image"> <img src="https://opgg-static.akamaized.net/logo/20211101145723.6a89d9d257114f1eba3ad2682885f0fa.png"></img></div>
        <InputGroup className="mb-3">
    
    <FormControl
      placeholder="Username"
      aria-label="Username"
      aria-describedby="basic-addon1"
      onChange={GetSummonerName}
      id="searchByName"
      name="searchByName"
    />
    <Button variant="primary" onClick={ChangeStatus}>검색</Button>{' '}
  </InputGroup>
       
      </div>                
  </div>
  {
    modalStatus === true 
    ? <GetRendering/> 
    : null
  }
   

    </div>
  );
}

export default App;

