-- 研修ワーク管理スペース — 主要 SQL（Prisma が生成するクエリの参考）
-- テーブル: trainings, courses, employees, course_enrollments

-- ■ 読み出し: 研修ツリー全体
SELECT
  t.id AS training_id,
  t.name AS training_name,
  c.id AS course_id,
  c.name AS course_name,
  c.date,
  c.location,
  e.id AS enrollment_id,
  emp.employee_number,
  emp.name,
  emp.department,
  emp.department_code
FROM trainings t
JOIN courses c ON c.training_id = t.id
LEFT JOIN course_enrollments e ON e.course_id = c.id
LEFT JOIN employees emp ON emp.employee_number = e.employee_number
ORDER BY t.created_at, c.sort_order, e.enrolled_at;

-- ■ 研修（親）追加
INSERT INTO trainings (id, name, created_at)
VALUES ($1, $2, NOW());

INSERT INTO courses (id, training_id, name, date, location, sort_order)
VALUES ($3, $1, $2, '未設定', '未設定', 0);

-- ■ コース追加
INSERT INTO courses (id, training_id, name, date, location, sort_order)
VALUES ($1, $2, $3, '未設定', '未設定', $4);

-- ■ 受講者追加（社員マスタ存在 + コース内重複なし）
INSERT INTO course_enrollments (id, course_id, employee_number, enrolled_at)
SELECT $1, $2, $3, NOW()
WHERE EXISTS (SELECT 1 FROM employees WHERE employee_number = $3)
  AND NOT EXISTS (
    SELECT 1 FROM course_enrollments
    WHERE course_id = $2 AND employee_number = $3
  );

-- ■ 受講者のコース移動
UPDATE course_enrollments
SET course_id = $1
WHERE id = $2
  AND NOT EXISTS (
    SELECT 1 FROM course_enrollments
    WHERE course_id = $1 AND employee_number = (
      SELECT employee_number FROM course_enrollments WHERE id = $2
    )
  );

-- ■ コースの日時・場所更新
UPDATE courses SET date = $1 WHERE id = $2;
UPDATE courses SET location = $1 WHERE id = $2;
