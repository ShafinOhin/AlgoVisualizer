import React from 'react';
import './App.css';
import {CSSTransition} from 'react-transition-group'
import { useSpring, animated } from 'react-spring'

var gridDimension = [21, 47]

var itemStateArray = [];
var sourceItemId = 252;
var destinationItemId = 272;
var globalAlgoValue;
var currentSelectorState = 3;
var mouseisDown = false;
var globalDelay = 12;
var gridUpdateDelay = 10;
var globalIsInputBlocked = false;
var globalGridUpdaterID;
var totalItem = gridDimension[0] * gridDimension[1];

// ----- variables for algos ---------
var level = new Array(totalItem).fill(99999);
var par = new Array(totalItem);

var dx = [1, -1, 0, 0];
var dy = [0, 0, 1, -1];
var Queue = [];


const itemState = {
  unvisited: 0,
  visited: 1,
  current: 2,
  block: 3,
  source: 4,
  destination: 5,
  pathItem: 6,
};

const bgColors = [
  'white',
  'aqua',
  'royalblue',
  'black',
  'chartreuse',
  'darkblue',
  'greenyellow',
];

function GlobalhandleMouseDown(e){
  mouseisDown = true;
}

function GlobalhandleMouseUp(e){
  mouseisDown = false;
}

function GlobalhandleMouseOut(e){
  //mouseisDown = false;  //TODO DEBUG THIS
}



function Item (props){
    var styles= {
      backgroundColor: bgColors[props.stateArray[props.id]],
    }
    
    return(
      <div className="item" id={props.id} 
        onClick={(e) => {props.itemCliked(e, props.id)}} 
        onMouseEnter={(e) => {props.handleMouseEnter(e, props.id)}} 
        onMouseDown = {(e) => {props.handleMouseDown(e, props.id)}} 
        onMouseUp = {(e) => {props.handleMouseUp(e, props.id)}} 
        style={styles}></div>
    );

}


function GridRow(props){
  var tempArray = new Array(props.rowLength).fill(1).map((x,i) => i);
  return <div className="row"> 
        {
          tempArray.map((x,i) => <Item 
            stateArray = {props.stateArray}
            itemCliked = {(e, id) => props.itemCliked(e, id)}
            handleMouseEnter = {(e, id) => props.handleMouseEnter(e, id)}
            handleMouseDown = {(e, id) => props.handleMouseDown(e, id)}
            handleMouseUp = {(e, id) => props.handleMouseUp(e, id)}
            key = {(props.rowNum*gridDimension[1] + i).toString()}
            id={(props.rowNum*gridDimension[1] + i).toString()} />)
        }
    </div>
}


function GridArea(props){

  var tempArray = new Array(props.dimension[0]).fill(1).map((x,i) => i);

    return <div className="grid-area">
        {
          tempArray.map((x,i) => <GridRow
            stateArray = {props.state.stateArray}
            key = {i}
            itemCliked = {props.handleItemClick}
            handleMouseEnter = {props.handleMouseEnter}
            handleMouseDown = {props.handleMouseDown}
            handleMouseUp = {props.handleMouseUp}
            rowLength = {props.dimension[1]}
            rowNum = {i} />)
        }
      </div>

}

function GridContainer(props){
  return <div className="grid-container" >
    <GridArea 
    handleItemClick = {props.handleItemClick}
    handleMouseDown = {props.handleMouseDown}
    handleMouseUp = {props.handleMouseUp}
    handleMouseEnter = {props.handleMouseEnter}
    state={props.state}
    dimension={props.dimension}/>
  </div>
}

function AlgorithmSelectForm(props){
    return <form className="algo-select-form">
      <label>Select an Algorithm: </label>
      <select value={props.algoValue} onChange={props.handleChange}>
        <option value="BFS">Breadth first search</option>
        <option value="DFS">Depth first search</option>
        <option value="DJK">Dijkstra</option>
      </select>
      <button className="start-button" onClick={props.startButtonClicked}>Start Visualize</button>
    </form>
    

}

function GridEditorSelectionForm(props){
  var styles = [
    {
      backgroundColor: 'Aquamarine',
    },
    {
      backgroundColor: 'darkkhaki',
    }
  ]

    return <div className="editorSelector">
      <button className="pushButton" onClick={props.handleSourceButtonClick} style={styles[props.state.sourceButton]}>Select Source</button>
      <button className="pushButton" onClick={props.handleDestinationButtonClick} style={styles[props.state.destinationButton]}>Select Destination</button>
      <button className="pushButton" onClick={props.handleAddBlockButtonClick} style={styles[props.state.blockButton]}>Add Blocks</button>
      <button className="pushButton" onClick={props.handleRemoveBlockButtonClick} style={styles[props.state.rmBlockButton]}>Remove Blocks</button>
      <button className="pushButton" onClick={props.handleClearGridButtonClick} style={styles[0]}>Clear Grid</button>
    </div>

}

function TopInputContainer(props){
    return <div className="top-input-container">
          <AlgorithmSelectForm 
            handleChange={props.handleAlgoChange}
              algoValue={props.state.algoValue}
              startButtonClicked={props.startButtonClicked}
            />
          <GridEditorSelectionForm 
            handleSourceButtonClick = {props.handleSourceButtonClick}
            handleDestinationButtonClick = {props.handleDestinationButtonClick}
            handleAddBlockButtonClick = {props.handleAddBlockButtonClick}
            handleRemoveBlockButtonClick = {props.handleRemoveBlockButtonClick}
            handleClearGridButtonClick = {props.handleClearGridButtonClick}
            state={props.state}
          />
      </div>
}

class RootContainer extends React.Component{
  constructor(props){
    super(props);
    clearInterval(globalGridUpdaterID);
    globalGridUpdaterID = setInterval(this.gridUpdater, gridUpdateDelay);
    this.cc = 0;
    itemStateArray = new Array(totalItem).fill(0);
    itemStateArray[sourceItemId] = itemState.source;
    itemStateArray[destinationItemId] = itemState.destination;
    this.state = {
      algoValue: 'BFS',
      sourceButton: 0,
      destinationButton: 0,
      blockButton: 1,
      rmBlockButton: 0,
      stateArray: itemStateArray,
    }
    currentSelectorState = 3;
    this.handleAlgoChange = this.handleAlgoChange.bind(this);
    this.handleSourceButtonClick = this.handleSourceButtonClick.bind(this);
    this.handleDestinationButtonClick = this.handleDestinationButtonClick.bind(this);
    this.handleAddBlockButtonClick = this.handleAddBlockButtonClick.bind(this);
    this.handleRemoveBlockButtonClick = this.handleRemoveBlockButtonClick.bind(this);
    this.handleClearGridButtonClick = this.handleClearGridButtonClick.bind(this);
    this.startButtonClicked = this.startButtonClicked.bind(this);

    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.updateArrayAndReRender = this.updateArrayAndReRender.bind(this);
  }

  // AlgoEditorSecton Handlers
  handleAlgoChange(event){
    if(globalIsInputBlocked) return;
    globalAlgoValue = event.target.value;
    this.setState({
      algoValue : event.target.value,
    });
    
  }

  //Buttons Section Handlers
  handleSourceButtonClick(event){
    if(globalIsInputBlocked) return;
    currentSelectorState = 4;
    this.setState({
      sourceButton: 1,
      destinationButton: 0,
      blockButton: 0,
      rmBlockButton: 0,
    });
    event.preventDefault();
  }

  handleDestinationButtonClick(event){
    if(globalIsInputBlocked) return;
    currentSelectorState = 5;
    this.setState({
      sourceButton: 0,
      destinationButton: 1,
      blockButton: 0,
      rmBlockButton: 0,
    });
    event.preventDefault();
  }

  handleAddBlockButtonClick(event){
    if(globalIsInputBlocked) return;
    currentSelectorState = 3;
    this.setState({
      sourceButton: 0,
      destinationButton: 0,
      blockButton: 1,
      rmBlockButton: 0,
    });
    event.preventDefault();
  }

  handleRemoveBlockButtonClick(event){
    if(globalIsInputBlocked) return;
    currentSelectorState = 0;
    this.setState({
      sourceButton: 0,
      destinationButton: 0,
      blockButton: 0,
      rmBlockButton: 1,
    });
    event.preventDefault();
  }

  handleClearGridButtonClick(event){
    if(globalIsInputBlocked) return;
    event.preventDefault();
    this.clearGrid();
  }

    clearGrid(){
      level = new Array(totalItem).fill(99999);
      par = new Array(totalItem);
      Queue = [];
      for(var ii=0; ii<totalItem; ii++) itemStateArray[ii] = 0;
      itemStateArray[sourceItemId] = itemState.source;
      itemStateArray[destinationItemId] = itemState.destination;
      this.setState({
        itemState: itemStateArray,
      })
    }


  //GridClick Handler Functions
  handleItemClick(e, id){
    if(globalIsInputBlocked) return;
    this.setState({
      stateArray: itemStateArray,
    });
  }

  handleMouseEnter(e, id){
    if(globalIsInputBlocked) return;
    if(mouseisDown)
      this.updateState(id);
  }

  handleMouseDown(e, id){
    if(globalIsInputBlocked) return;
    mouseisDown = true;
    e.preventDefault();
    this.updateState(id);
  }

  handleMouseUp(e, id){
    if(globalIsInputBlocked) return;
    //mouseisDown = false;
  }

  updateState(id){
      switch(currentSelectorState){
        case 4:
          if(itemStateArray[id] !== 0) break;
          itemStateArray[sourceItemId] = itemState.unvisited;
          sourceItemId = id;
          itemStateArray[sourceItemId] = itemState.source;
          break;
        case 5:
          if(itemStateArray[id] !== 0) break;
          itemStateArray[destinationItemId] = itemState.unvisited;
          destinationItemId = id;
          itemStateArray[destinationItemId] = itemState.destination;
          break;
        case 3:
          if(itemStateArray[id] !== 0) break;
          itemStateArray[id] = itemState.block;
          break;
        case 0:
          if(id == sourceItemId || id == destinationItemId) break;
          itemStateArray[id] = itemState.unvisited;
          break;
        default:
          break;
      }
      this.setState({
        stateArray: itemStateArray,
      });
  }

  startButtonClicked(event){
    event.preventDefault();
    if(globalIsInputBlocked) return;
    globalGridUpdaterID = setInterval(this.gridUpdater, 10);
    this.clearVisited();
    console.log("Global Algo value: " + this.state.algoValue);
    switch(this.state.algoValue){
      case "BFS": runBFSS(); console.log("Starting bfss"); break;
      case "DFS": runDFS(); break;
    }
  }
    clearVisited(){
      level = new Array(totalItem).fill(99999);
      par = new Array(totalItem);
      Queue = [];
      for(var ii=0; ii<totalItem; ii++) if(itemStateArray[ii] != itemState.block) 
        {itemStateArray[ii] = itemState.unvisited;}
      itemStateArray[sourceItemId] = itemState.source;
      itemStateArray[destinationItemId] = itemState.destination;
      this.setState({
        itemState: itemStateArray,
      })
    }

  gridUpdater = () => this.updateArrayAndReRender();

  updateArrayAndReRender(){
    var temp = itemStateArray[0];
    itemStateArray[0] = temp;
    this.setState({
      stateArray: itemStateArray,
    });
  }

  render(){
    if(globalIsInputBlocked == false) clearInterval(globalGridUpdaterID);
    console.log("grid updated");
    return <div className="inside-root-container" 
                onMouseDown={(e) => GlobalhandleMouseDown(e)}
                onMouseUp={(e) => GlobalhandleMouseUp(e)}
                onMouseOut={(e) => GlobalhandleMouseOut(e)}>
      <TopInputContainer 
        handleSourceButtonClick = {(e) => this.handleSourceButtonClick(e)}
        handleDestinationButtonClick = {(e) => this.handleDestinationButtonClick(e)}
        handleAddBlockButtonClick = {(e) => this.handleAddBlockButtonClick(e)}
        handleRemoveBlockButtonClick = {(e) => this.handleRemoveBlockButtonClick(e)}
        handleClearGridButtonClick = {(e) => this.handleClearGridButtonClick(e)}
        handleAlgoChange = {(e) => this.handleAlgoChange(e)}
        state={this.state}
        startButtonClicked={(e) => this.startButtonClicked(e)}
      />
      <GridContainer 
        handleItemClick = {(e, id) => this.handleItemClick(e, id)}
        handleMouseDown = {(e, id) => this.handleMouseDown(e, id)}
        handleMouseUp = {(e, id) => this.handleMouseUp(e, id)}
        handleMouseEnter = {(e, id) => this.handleMouseEnter(e, id)}
        state={this.state}
        dimension={gridDimension}
      />
    </div>
  }

}

function App() {
  const fadeIn = useSpring({
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  });
  return ( 
    <animated.div style={fadeIn}>
      <RootContainer />
    </animated.div>
  );
}

export default App;



function getCoOrdinate(id){
  return [
    parseInt(id)%gridDimension[1],
    parseInt(parseInt(id)/gridDimension[1])
  ]
}

function getId(coOrdinate){
  return (coOrdinate[1])*gridDimension[1] + coOrdinate[0];
}




////////------------------------------ ----------- BFS ALgo -----------------------------


function runBFSS(){
  var visitedQueue = [];
  var pathQueue = [];
  var doneAlgo = false;
  var copiedArray = [];
  for(var tt=0; tt<totalItem; tt++){
    par[tt] = tt;
    copiedArray.push(itemStateArray[tt]);
  }
  Queue.push(getCoOrdinate(sourceItemId));
  level[sourceItemId] = 0;
  console.log("BFS running");
  while(Queue.length != 0){
    var cr = Queue.shift();
    var crID = getId(cr);
    for(var ii=0; ii<4; ii++){
      var [x, y] = [cr[0]+dx[ii], cr[1]+dy[ii]];
      var ID = getId([x,y]);
      if(ID == destinationItemId){
        par[ID] = crID;
        console.log("Found! ", level[crID]+1);
        doneAlgo = true;
        break;
      }
      if(x < gridDimension[1] && x>=0 && y<gridDimension[0] && y>=0){
        if(copiedArray[ID] != itemState.visited && copiedArray[ID] != itemState.block && ID != sourceItemId){
          copiedArray[ID] = itemState.visited;
          visitedQueue.push(ID);
          Queue.push([x,y]);
          level[ID] = level[crID] + 1;
          par[ID] = crID;
        }
      }
    } 
    if(doneAlgo) break;
  }

  let tempDestinationID = destinationItemId;
  while(par[tempDestinationID] != tempDestinationID){
    pathQueue.push(tempDestinationID);
    tempDestinationID = par[tempDestinationID];
  }

  let timer = animateQueue(visitedQueue, itemState.visited, 0);
  animateQueue(pathQueue.reverse(), itemState.pathItem, timer + 2);
  
}


/// -------------------------------- DFS algo -----------------------------------

function runDFS(){
  var visitedQueue = [];
  var pathQueue = [];
  var doneAlgo = false;
  var copiedArray = [];
  for(var tt=0; tt<totalItem; tt++){
    par[tt] = tt;
    copiedArray.push(itemStateArray[tt]);
  }
  Queue = [];
  Queue.push(getCoOrdinate(sourceItemId));
  while(Queue.length != 0){
    console.log("DFS RUNNNING");
    var cr = Queue.pop();
    var crID = getId(cr);
    for(var ii=0; ii<4; ii++){
      var [x, y] = [cr[0]+dx[ii], cr[1]+dy[ii]];
      var ID = getId([x,y]);
      if(ID == destinationItemId){
        par[ID] = crID;
        console.log("Found! ");
        doneAlgo = true;
        break;
      }
      if(x < gridDimension[1] && x>=0 && y<gridDimension[0] && y>=0){
        if(copiedArray[ID] != itemState.visited && copiedArray[ID] != itemState.block && ID != sourceItemId){
          copiedArray[ID] = itemState.visited;
          visitedQueue.push(ID);
          Queue.push([x,y]);
          par[ID] = crID;
        }
      }
    } 
    if(doneAlgo) break;
  }

  let tempDestinationID = destinationItemId;
  while(par[tempDestinationID] != tempDestinationID){
    pathQueue.push(tempDestinationID);
    tempDestinationID = par[tempDestinationID];
  }

  let timer = animateQueue(visitedQueue, itemState.visited, 0);
  animateQueue(pathQueue.reverse(), itemState.pathItem, timer + 2);

}



// ------------------------------- Animator Function ---------------------------

function animateQueue(Queue, boxType, timer){
  var animeTimer = timer;
  globalIsInputBlocked = true;
  setTimeout(() => {
    globalIsInputBlocked = false;
  }, (animeTimer + ((Queue.length + 1) * 2)) * globalDelay);
  while(Queue.length != 0){
    let xyid = Queue.shift();
    setTimeout(() => {
      globalIsInputBlocked = true;
      itemStateArray[xyid] = itemState.current;
    }, (animeTimer+0.1) * globalDelay);
    setTimeout(() => {
      globalIsInputBlocked = true;
      itemStateArray[xyid] = boxType;
    }, (animeTimer+1.9) * globalDelay);
    animeTimer += 2;
  }
  return animeTimer;
}
