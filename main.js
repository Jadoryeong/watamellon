import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS_BASE } from "./fruits.js";

let FRUITS = FRUITS_BASE;

const engine = Engine.create(); //게임 엔진
const render = Render.create({ //렌더링
  engine,
  element: document.body, //게임을 어디에다 그릴것인가
  options: {
    wireframes: false, //기본값은 true로 되어 있지만 true로 되어 있을 경우 물리엔진을 시험해보는 화면으로 출력되게 되어 그래픽요소를 제외한 모습으로 보임 즉, 내가 설정한 색으로 안 보인다
    background: "#F7F4C8", //백그라운드 컬러(헥사 코드)
    width: 620, //게임 화면 너비
    height: 740, //게임 화면 높이
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 370, 30, 790, { //왼쪽벽, 괄호속에 x,y,너비, 높이 순으로 좌표가 들어감, 중앙을 기준으로 삼기에 오브젝트 길이의 중앙값으로 넣어줘야함
  isStatic: true, //기본적으로 물리엔진이 적용되어 있기때문에 true로 되어있지 않다면 벽이 계속 아래로 추락함
  render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(605, 370, 30, 790, { //오른쪽벽, 괄호속에 x,y,너비, 높이 순으로 좌표가 들어감, 중앙을 기준으로 삼기에 오브젝트 길이의 중앙값으로 넣어줘야함
  isStatic: true, //기본적으로 물리엔진이 적용되어 있기때문에 true로 되어있지 않다면 벽이 계속 아래로 추락함
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(310, 710, 620, 60, { //밑면, 괄호속에 x,y,너비, 높이 순으로 좌표가 들어감, 중앙을 기준으로 삼기에 오브젝트 길이의 중앙값으로 넣어줘야함
  isStatic: true, //기본적으로 물리엔진이 적용되어 있기때문에 true로 되어있지 않다면 벽이 계속 아래로 추락함
  render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(310, 100, 620, 2, {  //게임 오버 선
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
})

World.add(world, [leftWall, rightWall, ground, topLine]); //월드에 벽 추가

Render.run(render); //렌더링 실행
Runner.run(engine); //엔진 실행

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;

//과일 생성
function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 1.,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {  //윈도우 키 입력
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case "KeyA":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 590)
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 1,
          y: currentBody.position.y,
        });
      }, 5);
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {  //만약 두개의 과일이 같다면
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` }
          },
          index: index + 1,
        }
      );

      World.add(world, newBody);
    }

    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game over");
    }
  });
});

addFruit();
