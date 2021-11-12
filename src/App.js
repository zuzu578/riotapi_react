import './App.css';
import { InputGroup,FormControl,Nav,NavDropdown,Button,Table} from 'react-bootstrap';
import { useState,useEffect } from 'react';
import axios from 'axios'; 
import api_key from './Apikey'; // api key 
import GetData from './ResultPage.js';
import {Link , Route } from 'react-router-dom';
import jquery from 'jquery';
import $ from 'jquery';




function App() {
  
 


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
           // console.log('resdata ! => 1 ',response.data);
            setUserInfo(response.data);
  
            var convertingDate = new Date(response.data.revisionDate);
            var date = convertingDate;
            //console.log(date);
            setRevDate(date);

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
              
                setUserRank(response2.data[i]);
              }
             // console.log("setUserRank() set State 3 ");

            /**
             * @param puuId
             * @description 
             * puuId 를 이용하여 소환사의 매치ids 를 가져옵니다.
             * 
             */
            // console.log("user PuuId => " ,response.data.puuid );
             const response3 = await axios.get('https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/'+response.data.puuid+'/ids?start=0&count=15',{
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
                  // do something with response
                  users.push(response);
                  
               
               
                })
              )
         
            }
            
          

          //  console.log("promise all 6");       
          // 데이터를 가져오고 모달창을 켭니다. 
         // console.log("모달 상태 true 7");
         
          
          //console.log("전적 데이터 리스트 for loop axios 5");
          Promise.all(promises).then(()=>{ SetSummonInfo(users)})
          setModalStatus(true);
  }
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

       //console.log('getSummonInfo => ' , getSummonInfo );
      
        for(var i = 0 ; i < getSummonInfo.length;i++){
          for(var j = 0 ; j < getSummonInfo[i].data.info.participants.length; j++){
            
            // 검색한 소환사의 플레이정보를 가져옵니다 
            if(getSummonInfo[i].data.info.participants[j].summonerName == getUserInfo.name){
              console.log(getSummonInfo[i].data.info)


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
   
        /**
         *  for loop 로 저장한 객체들을 Object 화 합니다.
         */
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
        
        
//console.log('gameDuration=>' , gameDuration);
        return(
      <div className="gameDetail"> 
     
          <Table striped bordered hover>
	

        <tbody>
          {myGameChamHistoryList.map(function (listValue,index) {
            return (
              <tr key={index}>
             
                <td>   {gameMod[index].gameModes}<br/>
                    <small>{winStatusArr[index].win}</small><br/></td>
                  <td>
                 
                    {<img src={'https://opgg-static.akamaized.net/images/lol/champion/'+listValue+'.png?image=c_scale,q_auto,w_46&v=1635906101'} alt=""/>}<br/>
                       
                  <small>{listValue}</small>






                  </td>
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

                 
                    
                    
                  
                 
                
                
              
              </tr>
            );
          })}
          
                 
        </tbody>
        </Table>

        
          

        





      </div>
        


        

        )
      }

  

  /**
   * 가져온 소환사의 정보를 rendering 해줍니다. ( Modal status === true 일 경우에 동작 )
   * @returns 
   */
  const GetRendering  = ()=> { 
 
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

