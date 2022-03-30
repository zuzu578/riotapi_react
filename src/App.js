import './App.css';
import { InputGroup,FormControl,Nav,NavDropdown,Button,Table,Modal} from 'react-bootstrap';
import { useState,useEffect } from 'react';
import axios from 'axios'; 
import api_key from './Apikey'; // api key 
import GetData from './ResultPage.js';
import {Link , Route } from 'react-router-dom';
import jquery, { data } from 'jquery';
import $ from 'jquery';
import Q from 'q';




function App() {
  /**
   * init Function();
   */
  // App component => did Mounted 상태가 되면 api 가져오는 count 갯수를 초기에 설정해줍니다. 

  //count => 초기 값 : 10

  let[count , setCount] = useState(null);

  useEffect(() => {
    setCount(15);

  }, []);
  

  // 검색한 소환사의 이름을 저장하는 state 
  let [summonerName , setSummonerName] = useState(null);
 
  // 검색한 소환사의 정보를 가져옵니다.
  let[getUserInfo , setUserInfo] = useState(null);

  
  // 검색한 소환사의 랭크정보를 가져옵니다.
  let[getUserRank , setUserRank] = useState(null);

  //검색한 소환사의 매치 id list 를 가져옵니다.
  let[getMatchIdList , setMatchIdList] = useState(null);
  
  // timestamp!
  let[revDate , setRevDate] = useState(null);

  // 검색한 소환사의 매치 정보 데이터 
  let[getSummonInfo , SetSummonInfo] = useState(null);
  
  // 모달창의 상태 여부 state
  let [modalStatus,setModalStatus] = useState(false);
  // 게임리스트 가져오기 버튼 상태여부 state 
  let[fetchGameListButton, setFetchGameListButton] = useState(false);

  // 매치 상세보기 버튼 여부 
  let [DetailMatchButton , setDetailMatchButton] =useState(false); 

  let [encryptedId , setEncryptedId] = useState(null);

  let [ingameList , setIngameList ] = useState(null);

  let setIdLists = [];

  let [ingameUserRankArr,setUserArr] = useState(null);

  let ingameRankArr = [];



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
// 이벤트 scroll 시에도 data 를 fetch 할수 있게 합니다.
   async function ChangeStatus(e){

    //setCount(count+5); 클릭할때마다 전적 5개씩 추가해서 fetch !

    //console.log('count -> ' , count);
    //console.log("처음 1");
    
    
    if(!summonerName){
      alert('소환사 이름을 입력해주세요!');
      return false;
    }
       /**
        * @param summone0rName 
        * @description 
        * 소환사의 기본정보를 소환사의 이름 , api_key 를 이용하여 데이터를 가져옵니다.
        */
       const response = await axios.get('https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+summonerName+'',{
              params:{
               api_key: api_key,
              }
            })
           //console.log('resdata ! => 1 ',response.data);
            setUserInfo(response.data);
            setEncryptedId(response.data.id);
  
            var convertingDate = new Date(response.data.revisionDate);
            var date = convertingDate;
            //console.log(date);
            setRevDate(date);
        /**
         * @param encrytedSummonerId(response.data.id)
         * @description 암호화된 소환사의 id 를 이용하여 인게임 정보를 가져온다.
         * setIngameList() 
         */
        try{
          const fetchIngame = await axios.get('https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/'+response.data.id+'',{
          params:{
            api_key : api_key,
          }
        })
        //console.log("fetchIngame!! => " ,fetchIngame.data);

        for(let i = 0 ; i < fetchIngame.data.participants.length;i++){
         // console.log('fetchIngame.data =>',fetchIngame.data.participants[i].summonerId);
          setIdLists.push(fetchIngame.data.participants[i].summonerId);
        }

        //console.log('setIdLists',setIdLists);
       
         setIngameList(fetchIngame.data);
        }catch(error){
          
          //console.log('이 소환사는 현재 게임중이 아닙니다! ', error);
          //setIngameList(''+summonerName+'님은 게임중이 아닙니다.')
         //setIngameList('이소환사는 현재 게임중이 아닙니다.')
        }

        /**
         * @params setIdLists[]
         * @description 현재 인게임 정보의 소환사들의 league 정보를 가져옵니다.
         * 
         */
        try{
          
          for( let i = 0 ; i < setIdLists.length ; i++){
          //console.log('setIdLists -> ' ,setIdLists[i]);
            const getParticipantsLeague = await axios.get('https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/'+setIdLists[i]+'',{
              params:{
                api_key : api_key,
              }
            })
            //console.log(getParticipantsLeague.data[0].rank);
            //console.log('getParticipantsLeague =>' , getParticipantsLeague.data[0].summonerName);
            //console.log('tier',getParticipantsLeague.data[0].tier);
            /**
             *  인게임 정보 소환사들의 league 를 가져온다. 
             */
            
            for(let i = 0 ; i < getParticipantsLeague.data.length ; i++){
             // console.log('ingameUserRankData' ,getParticipantsLeague.data);
              // 솔로랭크 정보만 가져옵니다.
              if(getParticipantsLeague.data[i].queueType == 'RANKED_SOLO_5x5'){
              
             
                let obj = {
                  tier : getParticipantsLeague.data[i].tier,
                  rank : getParticipantsLeague.data[i].rank,
                  summonerName : getParticipantsLeague.data[i].summonerName,
                  leaguePoints : getParticipantsLeague.data[i].leaguePoints,
                }
                ingameRankArr.push(obj);

              }
            }

            //ingameRankArr.push(getParticipantsLeague.data[0].tier);
            setUserArr(ingameRankArr);



            /*
            let obj = {
              rank : getParticipantsLeague.data[i].rank,
              tier : getParticipantsLeague.data[i].tier,
            }

            ingameUserRankArr.push(obj);
            */


          }
          

        }catch(error){
          console.log(error);
        }
        
      
        


            //console.log("setUserInfo() set State 2 ");
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
                //console.log('검색한 소환사의 리그정보! ->',response2.data);
                setUserRank(response2.data[i]);
              }
             // console.log("setUserRank() set State 3 ");
            /**
             * 검색한 소환사의 encryptedId 를 기반으로 챔피언 숙련도 정보를 가져옵니다.
             */
             try{
              //console.log('get Champ Mastery =>' , response2.data[0].summonerId);
              const getChampMastery = await axios.get('https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/'+response2.data[0].summonerId+'',{
                params:{
                  api_key:api_key,
                }
              })
              console.log('getChampMastery => !' , getChampMastery);

             }catch(error){

             }
            /**
             * @param puuId
             * @description 
             * puuId 를 이용하여 소환사의 매치ids 를 가져옵니다.
             * 
             */
            // console.log("user PuuId => " ,response.data.puuid );
             const response3 = await axios.get('https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/'+response.data.puuid+'/ids?start=0&count='+count+'',{
              params:{
                api_key: api_key,
              }
            })
          
            setMatchIdList(response3.data);
           // console.log("setMatchIdList() set State  4");
           
           
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
                  users.push(response);
                })

                
              )
         
            }
          Promise.all(promises).then(()=>{ SetSummonInfo(users)})
          setModalStatus(true);
  }




  //console.log('getSummonInfo init() => ', getSummonInfo);
    /**
     * @desc 
     * 게임데이터 가져오기 버튼을 클릭하면 렌더링해주는 부분을 true 값으로 설정해줍니다. 
     * render component : RenderingGameList
     */
    function FetchGameList(){
      setFetchGameListButton(true);
  
    }
    /**
     * 
     * @returns 
     */


    let [nowClickGameId , setNowClickGameID ] = useState(); // 해당 현재 행을 클릭시 , 현재 게임아이디를 구한다.
    let [nowClickRow, setNowClickRow] = useState(); // 현재 클릭한 테이블 행 (row 값을 구한다.);

    function DetailMatch(gameMatchID,obj){
   
      setNowClickGameID(gameMatchID);

      if(DetailMatchButton == false){
        setDetailMatchButton(true);
      }else{
        setDetailMatchButton(false);
      }


  
      //console.log("매치 상세보기 버튼 상태 =>" , DetailMatchButton);
    }


    /**
     * 상세 매치 내용을 그려줍니다. ( 상세보기 클릭시 ,)
     * @returns 
     */
    let participantsArr = []; //참가한 챔피언 정보 
    let participantsNameArr = []; // 참가한 소환사 닉네임 정보
    let perks = [];
    let perksStyle = []; 
    let spell1 = [];
    let spell2 = [];

    let runesList =[];
    let spellList = [];
    let summonerLvl = []; 
    let kills=[];
    let deaths=[];
    let assist = [];
    let kdaCalcul = [];
    let gameItems1 = [];
    let gameItems2 = [];
    let gameItems3 = [];
    let gameItems4 = [];
    let gameItems5 = [];
    let gameItems6 = [];
    let gameItems7 = [];
    let winStatus = [];
    let individualPosition = [];
    let goldEarned = [] ;
    let minionKills = []; 
    let totalDamageDealtToChampions = []; 
    let totalDamageTaken = [];
    let wardsPlaced = []; 
    let wardsKilled = [];


    
    function DetailMatchRender(){
      //console.log('row length = > ' , getSummonInfo.length);
      for(let i = 0 ; i < getSummonInfo.length;i++){
        if(getSummonInfo[i].data.info.gameId == nowClickGameId){
          

          
          for(let q = 0 ; q < getSummonInfo[i].data.info.participants.length ; q ++){
              wardsKilled.push(getSummonInfo[i].data.info.participants[q].wardsKilled);
              wardsPlaced.push(getSummonInfo[i].data.info.participants[q].wardsPlaced);
              
              minionKills.push(getSummonInfo[i].data.info.participants[q].totalMinionsKilled + getSummonInfo[i].data.info.participants[q].neutralMinionsKilled)
              console.log(getSummonInfo[i].data.info.participants[q]);
              goldEarned.push(getSummonInfo[i].data.info.participants[q].goldEarned);
              if(getSummonInfo[i].data.info.participants[q].individualPosition == "JUNGLE"){
                individualPosition.push("정글")
              }else if(getSummonInfo[i].data.info.participants[q].individualPosition == "TOP"){
                individualPosition.push("탑")
              }else if(getSummonInfo[i].data.info.participants[q].individualPosition == "UTILITY"){
                individualPosition.push("서포터")
              }else if(getSummonInfo[i].data.info.participants[q].individualPosition == "BOTTOM"){
                individualPosition.push("원딜")
              }else if(getSummonInfo[i].data.info.participants[q].individualPosition == "MIDDLE"){
                individualPosition.push("미드")
              }
              
              // 승패 여부 
              if(getSummonInfo[i].data.info.participants[q].win == true){
                winStatus.push('승리')
              }else{
                winStatus.push('패배');
              }
              totalDamageDealtToChampions.push(getSummonInfo[i].data.info.participants[q].totalDamageDealtToChampions)
              totalDamageTaken.push(getSummonInfo[i].data.info.participants[q].totalDamageTaken)
              participantsNameArr.push(getSummonInfo[i].data.info.participants[q].summonerName);
              participantsArr.push(getSummonInfo[i].data.info.participants[q].championName);
              // 전적 스펠 
              spell1.push(getSummonInfo[i].data.info.participants[q].summoner1Id);
              spell2.push(getSummonInfo[i].data.info.participants[q].summoner2Id);
              // 전적 룬 
              perksStyle.push(getSummonInfo[i].data.info.participants[q].perks.styles[0].selections[0].perk);
              perks.push(getSummonInfo[i].data.info.participants[q].perks.styles[1].style)
              summonerLvl.push(getSummonInfo[i].data.info.participants[q].champLevel)
              kills.push(getSummonInfo[i].data.info.participants[q].kills)
              deaths.push(getSummonInfo[i].data.info.participants[q].deaths)
              assist.push(getSummonInfo[i].data.info.participants[q].assists)
              gameItems1.push(getSummonInfo[i].data.info.participants[q].item0)
              gameItems2.push(getSummonInfo[i].data.info.participants[q].item1)
              gameItems3.push(getSummonInfo[i].data.info.participants[q].item2)
              gameItems4.push(getSummonInfo[i].data.info.participants[q].item3)
              gameItems5.push(getSummonInfo[i].data.info.participants[q].item4)
              gameItems6.push(getSummonInfo[i].data.info.participants[q].item5)
              gameItems7.push(getSummonInfo[i].data.info.participants[q].item6)

               // kda 계산 
               if(parseInt(getSummonInfo[i].data.info.participants[q].kills + getSummonInfo[i].data.info.participants[q].assists) / parseInt(getSummonInfo[i].data.info.participants[q].deaths) == Infinity){
                
                kdaCalcul.push('Perfect')

              }else{

                kdaCalcul.push(parseInt(getSummonInfo[i].data.info.participants[q].kills + getSummonInfo[i].data.info.participants[q].assists) / parseInt(getSummonInfo[i].data.info.participants[q].deaths))
              
              }

              

            
          }
        }
       
      
      }
      
      for(var i=0; i < getSummonInfo.length; i++){
        var item = {
              mainPerks : perksStyle[i],
              subPerks : perks[i]
        }
        runesList.push(item);
    }

    for(var i=0; i < getSummonInfo.length; i++){
      var spellItems = {
            spellId1 : spell1[i],
            spellId2 : spell2[i]
      }
      spellList.push(spellItems);
  }
  
  let itemsList = [] ;
  for(var i=0; i < getSummonInfo.length; i++){
    var gameItems = {
          items1 : gameItems1[i],
          items2 : gameItems2[i],
          items3 : gameItems3[i],
          items4 : gameItems4[i],
          items5 : gameItems5[i],
          items6 : gameItems6[i],
          items7 : gameItems7[i],
    }
    itemsList.push(gameItems);
}


      
      return (
      <div className="matchInfoTable">
        <Table striped bordered hover>
          <h1 className="matchTitle">매치정보</h1>
        <tbody>
          {getSummonInfo.map(function (listValue,index) {
            return (
              <tr key={index}>
                <td>
                  <div>
                  {<img src={'https://opgg-static.akamaized.net/images/lol/champion/'+participantsArr[index]+'.png?image=c_scale,q_auto,w_46&v=1635906101'} alt=""/>}
                  <small className="smallFont_001">  {participantsNameArr[index]}  ({winStatus[index]})<br/>{individualPosition[index]}</small>
                  </div>
                  </td>
                  <td>
                  <img src={'https://z.fow.kr/spell/'+spellList[index].spellId1+'.png'}/>
                  <br/>
                  <img src={'https://z.fow.kr/spell/'+spellList[index].spellId2+'.png'}/>
                  <br/>
                  <img src={'https://opgg-static.akamaized.net/images/lol/perk/'+runesList[index].mainPerks+'.png?image=c_scale,q_auto,w_22&v=1635906101'}/><br/>
                  <img src={'https://opgg-static.akamaized.net/images/lol/perkStyle/'+runesList[index].subPerks+'.png?image=c_scale,q_auto,w_22&v=1635906101'}/>
                  
                  </td>
                  <td><small>레벨{summonerLvl[index]}</small></td>
                  <td><small>{kills[index]}/{deaths[index]}/{assist[index]} (cs:{minionKills[index]})<br/> 평점 ({kdaCalcul[index]})</small></td>
                  <td>
                  <div className="items_images">
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items1+'.png?image=q_auto:best&v=1635906101'}/> 
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items2+'.png?image=q_auto:best&v=1635906101'}/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items3+'.png?image=q_auto:best&v=1635906101'}/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items4+'.png?image=q_auto:best&v=1635906101'}/><br/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items5+'.png?image=q_auto:best&v=1635906101'}/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items6+'.png?image=q_auto:best&v=1635906101'}/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items7+'.png?image=q_auto:best&v=1635906101'}/>
                    <br/>
                    <small>골드({goldEarned[index]})</small>
                  
                  
                    </div> 

                  </td>
                  <td><small>딜량:{totalDamageDealtToChampions[index]}<br/>피해량:{totalDamageTaken[index]}</small></td> 
                  <td>와드설치/제거<small><br/>{wardsPlaced[index]}/{wardsKilled[index]}</small> </td>

                 
     
              </tr>
            );
          })}
          
                 
        </tbody>
        </Table>

        </div>

      )
  
    }
    /**
     * 
     * @returns 
     * @desc
     * 가져와서 저장한 게임 전적 리스트를 렌더링해줍니다.
     */

      const RenderingGameList = () =>{
        var champLevel = []; //챔피언 레벨 
        var winStatus = []; // 승패 여부 

        var myGameChamHistoryList = []; // 검색한 사용자의 전적 챔프 
        //var summonerName2 = summonerName;
        var perksStyle = [];
        var perks = [];
        var spell1 = [] ;
        var spell2 = [] ;
       // var obj = {};
        var gameItems1= [] ; //아이템1
        var gameItems2= [] ; //아이템2
        var gameItems3= [] ; //아이템3
        var gameItems4= [] ; //아이템4
        var gameItems5= [] ; //아이템5
        var gameItems6= [] ; //아이템6
        var gameItems7= [] ; //아이템7
      // 소환사 kda 
        var kills = [];  
        var deaths = [];
        var assists = [];
        var kdaCalcul = []; //소환사 kda 계산 값 

      // 소환사 미니언 처치수 
      var minionKills = []; 

      var gameModeList = [] ; 

      var gameDurationList = []; 
      
      var wardPlacedList = [];

      var championName = []; 
      var summonerName = [];

      var gameMatchID = [];
      
      let gameCreation = [];
      let timeMinuets = [];


      
      
        for(var i = 0 ; i < getSummonInfo.length;i++){

          //console.log("edata => " , getSummonInfo[i].data.info.gameDuration);
          //let durationTimeData = new Date(getSummonInfo[i].data.info.gameDuration)
          var timestamp = getSummonInfo[i].data.info.gameDuration;

          // 시간으로 계산할경우
          var hours = Math.floor(timestamp / 60 / 60);
          // 분으로 계산할 경우
          var minutes = Math.floor(timestamp / 60);
          timeMinuets.push(minutes);
          //console.log('minutes',minutes);

          gameMatchID.push(getSummonInfo[i].data.info.gameId);
          for(var j = 0 ; j < getSummonInfo[i].data.info.participants.length; j++){
            //console.log(getSummonInfo[i].data.info.participants[j].summonerName)

            summonerName.push(getSummonInfo[i].data.info.participants[j].summonerName)
           championName.push(getSummonInfo[i].data.info.participants[j].championName)

            // 검색한 소환사의 플레이정보를 가져옵니다 
            if(getSummonInfo[i].data.info.participants[j].summonerName == getUserInfo.name){
              //console.log(getSummonInfo[i].data.info)
              //console.log('검색한 소환사 데이터',getSummonInfo[i].data.info.gameCreation);
              let creationDate2 = new Date(getSummonInfo[i].data.info.gameCreation).toString();
              //console.log(creationDate2);
              let creationDate = creationDate2.replace('GMT+0900 (한국 표준시)','').toString();
              //console.log('creationDate =>',creationDate);

              gameCreation.push(creationDate);

              // 제어와드  설치 갯수  participants[j].detectorWardsPlaced
              //console.log('와드 => ' , getSummonInfo[i].data.info.participants[j].detectorWardsPlaced)

              wardPlacedList.push(getSummonInfo[i].data.info.participants[j].detectorWardsPlaced)

              // 게임 지속 시간 (총 시간)
              var gameDurations = new Date(getSummonInfo[i].data.info.gameStartTimestamp);

              gameDurationList.push(gameDurations)
              // 게임 모드 
              gameModeList.push(getSummonInfo[i].data.info.gameMode)
              // 미니언 처치 => 총 미니언 킬수 + 중립미니언 처치수 
              //getSummonInfo[i].data.info.participants[j].totalMinionsKilled + getSummonInfo[i].data.info.participants[j].neutralMinionsKilled
              minionKills.push(getSummonInfo[i].data.info.participants[j].totalMinionsKilled + getSummonInfo[i].data.info.participants[j].neutralMinionsKilled)
              
              
              champLevel.push(getSummonInfo[i].data.info.participants[j].champLevel)
              kills.push(getSummonInfo[i].data.info.participants[j].kills)
              deaths.push(getSummonInfo[i].data.info.participants[j].deaths)
              assists.push(getSummonInfo[i].data.info.participants[j].assists)
              
              // kda 계산 
              if(parseInt(getSummonInfo[i].data.info.participants[j].kills + getSummonInfo[i].data.info.participants[j].assists) / parseInt(getSummonInfo[i].data.info.participants[j].deaths) == Infinity){
                
                kdaCalcul.push('Perfect')

              }else{

                kdaCalcul.push(parseInt(getSummonInfo[i].data.info.participants[j].kills + getSummonInfo[i].data.info.participants[j].assists) / parseInt(getSummonInfo[i].data.info.participants[j].deaths))
              
              }
              
              
              if(getSummonInfo[i].data.info.participants[j].win == true){
                //console.log('승리')
                winStatus.push('승리');
              }
              if(getSummonInfo[i].data.info.participants[j].win == false){
                //console.log('승리')
                winStatus.push('패배');
              }

               
                // 전적 챔피언 초상화
                myGameChamHistoryList.push(getSummonInfo[i].data.info.participants[j].championName);
                // 전적 스펠 
                spell1.push(getSummonInfo[i].data.info.participants[j].summoner1Id);
                spell2.push(getSummonInfo[i].data.info.participants[j].summoner2Id);
                // 전적 룬 
                perksStyle.push(getSummonInfo[i].data.info.participants[j].perks.styles[0].selections[0].perk);
                perks.push(getSummonInfo[i].data.info.participants[j].perks.styles[1].style)
                // 아이템 1,2,3,4,5,6,7
                gameItems1.push(getSummonInfo[i].data.info.participants[j].item0)
                gameItems2.push(getSummonInfo[i].data.info.participants[j].item1)
                gameItems3.push(getSummonInfo[i].data.info.participants[j].item2)
                gameItems4.push(getSummonInfo[i].data.info.participants[j].item3)
                gameItems5.push(getSummonInfo[i].data.info.participants[j].item4)
                gameItems6.push(getSummonInfo[i].data.info.participants[j].item5)
                gameItems7.push(getSummonInfo[i].data.info.participants[j].item6)
            }
            
          }

        
        }
      
        var rowData = []; // 참가한 소환사 list
        var champNameData =[]; //참가한 소환사 챔피언 이름 
        var index = []; // 초기 data count 
        for(var i = 1; i < count + 1; i++){
        // console.log('i X 10 ===>' ,i*10);
          //console.log(index.push(i*10));
          index.push(i*10)
        }
       // console.log('index =>!!!!!! ' , index);
      
        var cnt = 0;
        /**
         * 
         * @param {*} pushData 
         * @returns 
         *  게임 참가자들을 obj 로 만듭니다.
         */
        function Temp(pushData){
     //     console.log("pushData2!!!!! => " , pushData);
          var obj = null;
          var subIndex = [5,10]
          var k = 0;

          var team = [];
          var enemy = []; 

          for(var i = 0 ; i < pushData.length; i++){

            
            if(i < subIndex[0]){
              team.push(pushData[i]); 
            }else if(i > 4 && i < subIndex[1]){
              enemy.push(pushData[i]); 
            }

           //console.log('pushData =>' , pushData[i]);
          }

          //console.log('team, enemy => ' ,team,enemy)



       
          var participantsListObj  = {
            teams : team,
            enemys : enemy,
          
          
      }

          return participantsListObj


        }


        function ChampPushList(participantsChampion){
          //console.log("pushData2 => " , pushData);
          var obj = null;
          var subIndex = [5,10]
          var k = 0;

          var team = [];
          var enemy = []; 

          for(var i = 0 ; i < participantsChampion.length; i++){

            
            if(i < subIndex[0]){
              team.push(participantsChampion[i]); 
            }else if(i > 4 && i < subIndex[1]){
              enemy.push(participantsChampion[i]); 
            }

           //console.log('pushData =>' , pushData[i]);
          }

          //console.log('team, enemy => ' ,team,enemy)



       
          var participantsChampionObj  = {
            teams : team,
            enemys : enemy,
          
          
      }
      //console.log("participantsChampionObj" , participantsChampionObj);

          return participantsChampionObj


        }
        

        



        var indexcnt = 0;
        var subData = [];
        var j = 0;
        var pushData = []; //참여한 소환사 이름 목록
        var participantsChampion = [];

        /**
         * 참가한 소환사 이름을 5대 5로 나눕니다.
         * 0 ~ 9 (10) 9 19
         */
        for(var i=0; i < summonerName.length; i++){

          //console.log("i => " , i);  
          if(j > 9){ 
            //console.log("j count ->" , j);
            break;
           }

          if(i < index[j]){
            //console.log("summonerName -> ",summonerName);
            pushData.push(summonerName[i]);
          //  console.log("pdata =>",pushData);
          }
        
          //console.log("length = " + pushData);
          if(pushData.length == 10){
           // console.log("j = " + j);
           // console.log("push Data =>" , pushData);
            var obj = null;
            var subIndex = [5,10]
            var k = 0;
            // 참가자 
            var team = [];
            var enemy = []; 
            obj = Temp(pushData);

            rowData.push(obj);

            
           
            j++;
            pushData = [];

           
          }
          
        }


        


   
        /**
         *  for loop 로 저장한 객체들을 Object 화 합니다.
         */
        

       // console.log('rowData => ', rowData)
       // console.log('champNameData => ', champNameData)
        
        var winStatusArr = []; //승패 여부 상태 값 
        
        var list = []; //룬을 담는 배열 
        
        var spellList = []; // 스펠을 담는 배열 

        var itemsList = []; // 아이템을 담는 배열

        var kdaList = []; // 소환사 kda 
        
        var kdaCalculList = []; //소환사 kda 계산 

        var champLevels = []; // 검색한 소환사가 플레이 했던 챔피언 레벨 

        var csKills = []; // 소환사가 처치한 미니언수 
        
        var gameMod = []; // 소환사가 플레이한 게임 모드 

        var gameDuration = []; // gameDurationList

        var wardPlaced = []; // wardPlacedList


        var participantsList  = []; // 아군 정보 

        var participantsList2 = []; // 적군 정보 
   
        



        for(var i=0; i < getSummonInfo.length; i++){
          var ward  = {
            warding : wardPlacedList[i],
                
          }
          wardPlaced.push(ward);
      }


        for(var i=0; i < getSummonInfo.length; i++){
          var gameDurations2  = {
            gameDuration : gameDurationList[i],
                
          }
          gameDuration.push(gameDurations2);
      }



        for(var i=0; i < getSummonInfo.length; i++){
          var gModes = {
                gameModes : gameModeList[i],
                
          }
          gameMod.push(gModes);
      }



        for(var i=0; i < getSummonInfo.length; i++){
          var totalCs = {
                cs : minionKills[i],
                
          }
          csKills.push(totalCs);
      }
       


        for(var i=0; i < getSummonInfo.length; i++){
          var gameItems = {
                items1 : gameItems1[i],
                items2 : gameItems2[i],
                items3 : gameItems3[i],
                items4 : gameItems4[i],
                items5 : gameItems5[i],
                items6 : gameItems6[i],
                items7 : gameItems7[i],
          }
          itemsList.push(gameItems);
      }


        for(var i=0; i < getSummonInfo.length; i++){
            var item = {
                  mainPerks : perksStyle[i],
                  subPerks : perks[i]
            }
            list.push(item);
        }

        for(var i=0; i < getSummonInfo.length; i++){
          var spellItems = {
                spellId1 : spell1[i],
                spellId2 : spell2[i]
          }
          spellList.push(spellItems);
      }

        //console.log("list ====> " + list);

        for(var i = 0 ; i < getSummonInfo.length;i++){
          var perksItems = itemsList[i];
         //console.log("list ==> " , perksItems["items1"] );
        }

        //console.log('perks=> ' ,perks);

        //console.log('perksStyle=> ' ,perksStyle);
       
        for(var i=0; i < getSummonInfo.length; i++){
          var winStatusA = {
               win:winStatus[i],
          }
          winStatusArr.push(winStatusA);
         // console.log(winStatusArr[i].win)
      }

      for(var i=0; i < getSummonInfo.length; i++){
        var kdaItems = {
              kill : kills[i],
              death : deaths[i],
              assist : assists[i],
              
        }
        kdaList.push(kdaItems);
    }

    for(var i=0; i < getSummonInfo.length; i++){
      var kdaCal = {
            kdaCalculate : kdaCalcul[i],
          
      }
      kdaCalculList.push(kdaCal);
  }


  for(var i=0; i < getSummonInfo.length; i++){
    var cahmpLevelItems = {
          championLevels : champLevel[i],
          
    }
    champLevels.push(cahmpLevelItems);
}



//var tempParty = [] ; 

// 아군 참가자 
//console.log('summonerName=>',summonerName);



for(var i=0; i < 5; i++){
  var participants1 = {
 
    summonerName : summonerName[i],
    championName : championName[i]
        
  }
  participantsList.push(participants1);
}

// 적군 참가자 

for(var i = 5; i < 10 ; i++){
  var participants2 = {
    summonerName : summonerName[i],
    championName : championName[i]
  }

  participantsList.push(participants2);
}

//console.log('summonerName =======>!!@!E2',summonerName);


//console.log('temp9 => ', temp9);

        
 // console.log('rowData =>', rowData);      
//console.log('participantsList=>' , participantsList);
//console.log('participantsList2=>' , participantsList2);
//console.log('tempParty = > ' , tempParty);
        return(
      <div className="gameDetail"> 
          <div className="view_participants">
            {
               DetailMatchButton === true 
               ? <DetailMatchRender/> 
               : null
            }
          </div>
        <div>
          <Table striped bordered hover>
        <tbody>
          {myGameChamHistoryList.map(function (listValue,index) {
            return (
              <tr key={index}>
                <td>   {gameMod[index].gameModes}<br/>
                    <small>{winStatusArr[index].win}</small><br/>
                    <small>{timeMinuets[index]}분</small>
                </td>
                <td>
                 
                    {<img src={'https://opgg-static.akamaized.net/images/lol/champion/'+listValue+'.png?image=c_scale,q_auto,w_46&v=1635906101'} alt=""/>}<br/>
                       
                  <small>{listValue}</small>

                  </td>
                  <td><small>{gameCreation[index]}</small></td>
                  <td>
                  <img src={'https://z.fow.kr/spell/'+spellList[index].spellId1+'.png'}/>
                  <br/>
                  <img src={'https://z.fow.kr/spell/'+spellList[index].spellId2+'.png'}/><img src={'https://opgg-static.akamaized.net/images/lol/perk/'+list[index].mainPerks+'.png?image=c_scale,q_auto,w_22&v=1635906101'}/><br/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/perkStyle/'+list[index].subPerks+'.png?image=c_scale,q_auto,w_22&v=1635906101'}/>
                 
                  <br/>
                     
                  </td>

                  <td>{kdaList[index].kill}/{kdaList[index].death}/{kdaList[index].assist}<br/>
                  <small>{kdaCalculList[index].kdaCalculate} 평점</small>
                  </td>
                  <td>레벨{champLevels[index].championLevels} <br/> <small>({csKills[index].cs}) CS</small></td>
                  
                  <td>
                    <div className="items_images">
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items1+'.png?image=q_auto:best&v=1635906101'}/> 
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items2+'.png?image=q_auto:best&v=1635906101'}/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items3+'.png?image=q_auto:best&v=1635906101'}/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items4+'.png?image=q_auto:best&v=1635906101'}/><br/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items5+'.png?image=q_auto:best&v=1635906101'}/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items6+'.png?image=q_auto:best&v=1635906101'}/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/item/'+itemsList[index].items7+'.png?image=q_auto:best&v=1635906101'}/>
                    </div>     

                       <div className="detectedWard">
                        <img src="https://opgg-static.akamaized.net/images/site/summoner/icon-ward-blue.png"/><small>제어 와드 {wardPlaced[index].warding}</small>


                    </div>     
                    </td>
                    <td>  <div className="detailButton"><small onClick={ () => DetailMatch(gameMatchID[index],this)}> 상세보기 </small></div></td>
                    <tr>
              
                    </tr>
                  
                    
              
              </tr>
            );
          })}
          
                 
        </tbody>
        </Table>
        </div>
                  
        
      </div>
        


        

        )
      }

      let [showIngameModalStatus , setShowIngameModalStatus] = useState(false);
      /**
       * ingame 정보 data modal 창 on off 여부 
       */
      const ShowIngameModal = ()=>{
       // console.log("Ingame!", encryptedId);
        if(showIngameModalStatus === false){
          setShowIngameModalStatus(true);
        }else{
          setShowIngameModalStatus(false);
        }
      }
     
      /**
       * 인게임 정보 데이터 보여주기 ( rendering )
       */
      const ShowIngameRender =() =>{
      //console.log('ingameUserRankArr',ingameUserRankArr);
      //console.log('ingameRankArr ====>' ,ingameUserRankArr);
        let data = ingameList;
        let summonerObj = {};
        let objList = [];
        let summonerId = [];
        //let createGameTime = [];
        let date = ''; 
        
       
        /*  */
        try{
          //console.log('인게임 정보 데이터! => ' ,data);
          date = new Date(data.gameStartTime);
          
        
          for(let i = 0 ; i < data.participants.length ; i++){
            //console.log(data.participants[i].summonerId);
            summonerId.push(data.participants[i].summonerId)
          

            summonerObj={
              profileIcon : data.participants[i].profileIconId,
              summonerName: data.participants[i].summonerName,
              spell1Id: data.participants[i].spell1Id,
              spell2Id: data.participants[i].spell2Id,
              perkStyle : data.participants[i].perks.perkIds[0],
              perkSubStyle: data.participants[i].perks.perkSubStyle,
              
              //bannedChampions : data.bannedChampions[i].championId,

            }
            objList.push(summonerObj);
        }
       
        //getIngameUserLeague(summonerId);
        console.log("timestamp to date =>" , date.toString());
        return (
          
          <Table striped bordered hover>
            
            <h1 className="ingametitle">인게임 정보 ({data.gameMode})</h1>
          <tbody>
            <th><small>게임시작일 :{date.toString()}</small></th>
            {objList.map(function (items,index) {
              return (
                <tr key={index}>
                  <td> 
                    <div className="imageC">
                      <img src={'https://opgg-static.akamaized.net/images/profile_icons/profileIcon'+objList[index].profileIcon+'.jpg?image=q_auto:best&v=1518361200'} alt=""/>
                      <small><span className="para2">{objList[index].summonerName}</span></small>
                    
                    </div> 
                   
                  </td>
                  <td>
                  <div className="runeImages2">
                    <img src={'https://opgg-static.akamaized.net/images/lol/perk/'+objList[index].perkStyle+'.png?image=c_scale,q_auto,w_22&v=1635906101'}/><br/>
                    <img src={'https://opgg-static.akamaized.net/images/lol/perkStyle/'+objList[index].perkSubStyle+'.png?image=c_scale,q_auto,w_22&v=1635906101'}/>
                  </div>
                  </td>
                  <td>
                    <small>
                      <img src={'https://opgg-static.akamaized.net/images/medals/'+ingameUserRankArr[index].tier+'_1.png?image=c_scale,q_auto,c_scale,w_30&v=1'}/>
                      
                    </small>
                    <small>{ingameUserRankArr[index].tier}({ingameUserRankArr[index].leaguePoints} LP) </small>
                  </td>
             
                
                
                
       
                </tr>
              );
            })}
            
                   
          </tbody>
          </Table>
  
        )
          }catch(error){
           // console.log("error in game ! =>" ,error);
            return(
              <div> 
                <div className="notPlayingGame">
                  <h1> '{summonerName}'님은 게임중이 아닙니다.</h1>
                  <p>현재 게임중이라면 다시 시도해주세요.</p>
                  <p>('Bot'은 RiotAPI에서 인게임 정보를 가져올 수 없습니다.)</p>
                </div>
              </div>
            )
          }

       
       
       
      }

  

  /**
   * 가져온 소환사의 정보를 rendering 해줍니다. ( Modal status === true 일 경우에 동작 )
   * @returns 
   */
  const GetRendering  = ()=> { 

    //console.log("getRender! ", getUserInfo.revisionDate);
    let revisionDate2 = new Date(getUserInfo.revisionDate).toString();
    let revisionDate = revisionDate2.replace('GMT+0900 (한국 표준시)','');
   //console.log('revisionDate',revisionDate2.replace('GMT+0900 (한국 표준시)',''));

          try{
            return(
              <div className="renderingSummonerInfo">        
                <h1>
                  <div className="image_box">
                    <img src={'https://opgg-static.akamaized.net/images/profile_icons/profileIcon'+getUserInfo.profileIconId+'.jpg?image=q_auto:best&v=1518361200'} alt=""/>
                    {getUserInfo.name}(Lv:{getUserInfo.summonerLevel})   
                  </div>
                  </h1>
                  
                
                <div><small>최근 업데이트: {revisionDate.toString()}</small></div>
                <div className="liveGame_info">
                  <Button variant="primary" onClick={ShowIngameModal}>인게임 정보</Button>
                </div>
        
                {
                  showIngameModalStatus === true
                  ? <ShowIngameRender/>
                  : null 
                }
        
                <div>  </div>
                <div className="rankArea">
                  <img src={'https://opgg-static.akamaized.net/images/medals/'+getUserRank.tier+'_1.png?image=q_auto:best&v=1'}/> 
                <span className="tier">{getUserRank.tier} {getUserRank.rank}</span>
                <div> {getUserRank.queueType}</div>
                {getUserRank.leaguePoints}LP / 승: {getUserRank.wins} 패 : {getUserRank.losses}</div>
                
                {
                fetchGameListButton === true 
                ? <RenderingGameList/> 
                : null
                }
                <div className="fetchingButton" onClick={FetchGameList}>
                <span>게임 데이터 가져오기 </span>
                </div>
                
            
                <div>
                
              
        
        
                </div>
              
              
              </div>
            )

          }catch(error){
            console.log(' 해당소환사는 언랭 입니다.');
            return(


              <div className="renderingSummonerInfo">
        
                <h1>
                  <div className="image_box">
        
                  <img src={'https://opgg-static.akamaized.net/images/profile_icons/profileIcon'+getUserInfo.profileIconId+'.jpg?image=q_auto:best&v=1518361200'} alt=""/>
                  {getUserInfo.name}(Lv:{getUserInfo.summonerLevel})   
                
                  </div>
                  </h1>
                  
                
                <div><small>최근 업데이트: {revisionDate.toString()}</small></div>
               
                <div className="liveGame_info">
                  
                  <Button variant="primary" onClick={ShowIngameModal}>인게임 정보</Button>
                </div>
        
                {
                  showIngameModalStatus === true
                  ? <ShowIngameRender/>
                  : null 
                }
        
                <div>  </div>
                <div className="rankArea">
                  <img src="https://opgg-static.akamaized.net/images/medals/default.png?image=q_auto:best&v=1"></img>
                <span className="tier"> unranked</span>
                <div> </div>
                </div>
                
                {
                fetchGameListButton === true 
                ? <RenderingGameList/> 
                : null
                }
                <div className="fetchingButton" onClick={FetchGameList}>
                <span>게임 데이터 가져오기 </span>
                </div>

                <div>
    
                </div>

              </div>
            )

          }
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

