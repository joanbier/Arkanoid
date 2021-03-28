(function() {
  const game_state = {
    score: 0,
    lifes: 3
  };

  const game_element = document.getElementById("arkanoid");
  const ref_elements = game_element.querySelectorAll("[ref]");

  const elements = (refs => {
    const output = {};

    for (let element of refs) {
      const key = element.getAttribute("ref");
      output[key] = element;
    }

    return output;
  })(ref_elements);

  // const elements_reduce = ref_elements.reduce((acc, element) => {
  //     const key = element.getAttribute("ref");
  //     acc[key] = element;
  //     return acc;
  // }, {})

  const {
    arena: arena_element,
    ball: ball_element,
    bricks: bricks_element,
    lifes: lifes_element,
    paddle: paddle_element,
    score: score_element
  } = elements;

  // const ball_featurs = ball_element.getBoundingClientRect();
  // const { height: ball_height, left: ball_left } = ball_featurs;
  // console.log(ball_height, ball_left);

  const arena_width = arena_element.offsetWidth;
  const arena_height = arena_element.offsetHeight;
  const paddle_width = paddle_element.offsetWidth;
  const ball_diameter = ball_element.offsetWidth;
  const paddle_top = paddle_element.offsetTop;

  function create_bricks() {
    const fragment = document.createDocumentFragment();
    const points = [1, 3, 5];
    const create_brick_elements = num =>
      [...new Array(num)].forEach(() => {
        const get_random_point =
          points[Math.floor(points.length * Math.random())];
        const brick = document.createElement("div");
        brick.classList.add("brick");
        brick.dataset.score = `${get_random_point}`;
        brick.textContent = brick.getAttribute("data-score");
        if (brick.textContent === "1") {
          brick.style.backgroundColor = "#F5A5D2";
        }
        if (brick.textContent === "3") {
          brick.style.backgroundColor = "#0CC8F2";
        }
        if (brick.textContent === "5") {
          brick.style.backgroundColor = "#F2DF24";
        }
        fragment.appendChild(brick);
      });
    create_brick_elements(27);
    bricks_element.appendChild(fragment);
  }
  create_bricks();

  const set_start_position = () => {
    const paddle_left = (arena_width - paddle_width) / 2;
    paddle_element.style.left = `${paddle_left}px`;

    Object.assign(ball_element.style, {
      top: `${paddle_top - ball_diameter}px`,
      left: `${(paddle_width - ball_diameter) / 2 + paddle_left}px`
    });
  };

  const {
    left: arena_left_rect,
    top: arena_top_rect
  } = arena_element.getBoundingClientRect();

  let counter_of_hits = 27;

  const start_ball = () => {
    let delta_x = 1;
    let delta_y = -1;

    const uid = setInterval(() => {
      const top = ball_element.offsetTop + delta_y;
      const left = ball_element.offsetLeft + delta_x;

      const padde_left_edge = parseInt(paddle_element.style.left, 10);
      const paddle_right_edge = padde_left_edge + paddle_width;
      const center_ball =
        parseInt(ball_element.style.left, 10) + ball_diameter / 2;
      const axis_of_hit = top + ball_diameter;

      ball_element.style.left = `${left}px`;
      ball_element.style.top = `${top}px`;

      if (left <= 0 || left > arena_width - ball_diameter) {
        delta_x *= -1;
      }

      if (top <= 0) {
        delta_y *= -1;
      }

      if (
        axis_of_hit === paddle_top &&
        center_ball >= padde_left_edge &&
        center_ball <= paddle_right_edge
      ) {
        delta_y *= -1;
        game_state.score++;
        score_element.textContent = game_state.score;
      }

      const element_from_point = document.elementFromPoint(
        arena_left_rect + left - ball_diameter / 2,
        arena_top_rect + top
      );

      if (element_from_point.classList.contains("brick")) {
        element_from_point.classList.add("hide");
        delta_y *= -1;
        game_state.score += Number(
          element_from_point.getAttribute("data-score")
        );
        score_element.textContent = game_state.score;
        --counter_of_hits;
        check_win();
      }

      if (top > arena_height - ball_diameter) {
        lifes_element.textContent = --game_state.lifes;
        check_lives();
        clearInterval(uid);
        document.removeEventListener("mousemove", onMove, false);
        set_start_position();
      }
    }, 4);

    return uid;
  };

  const onMove = function(e) {
    const center_of_paddle =
      (window.innerWidth - arena_width) / 2 + paddle_width / 2;
    const arena_left = arena_element.offsetLeft;
    const x = Math.min(
      arena_left + arena_width - paddle_width,
      Math.max(arena_left, e.pageX - center_of_paddle)
    );
    paddle_element.style.left = `${x}px`;
  };

  paddle_element.addEventListener(
    "mousedown",
    function(e) {
      start_ball();
      document.addEventListener("mousemove", onMove, false);
    },
    false
  );

  document.addEventListener(
    "mouseup",
    function(e) {
      document.removeEventListener("mousemove", onMove, false);
    },
    false
  );

  function reset_game() {
    set_start_position();
    [...document.querySelectorAll(".brick")].forEach(item => item.remove());
    create_bricks();
    game_state.score = 0;
    score_element.textContent = game_state.score;
    game_state.lifes = 3;
    lifes_element.textContent = game_state.lifes;
  }

  function check_lives() {
    if (game_state.lifes === 0) {
      alert(`GAME OVER\nZdobyto ${game_state.score} pkt`);
      reset_game();
    }
  }

  function check_win() {
    if (counter_of_hits === 0) {
      setTimeout(() => {
        alert(`Wygrales!!!\nZdobyto ${game_state.score} pkt`);
        reset_game();
      }, 1000);
    }
  }

  // const template = document.createElement("template");

  // const create_html_brick_elements = num =>
  //   [...new Array(num)].map(() => `<div class="brick"></div>`).join("");

  // template.innerHTML = create_html_brick_elements(27);
  // bricks_element.appendChild(template.content);

  // function fn(min, max, num) {
  //   return Math.min(max, Math.max(min, num));
  // }

  set_start_position();
})();
