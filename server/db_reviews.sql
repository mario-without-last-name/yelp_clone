-- NOT NULL must come after data type
CREATE TABLE reviews (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
  name VARCHAR(50) NOT NULL,
  review TEXT NOT NULL,
  rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5)
);

-- string should use ''   not ""
Sure! Here are 5 random rows for the reviews table:

-- automatically rejects if restaurant_id does not exist in restaurants table
INSERT INTO reviews (restaurant_id, name, review, rating) VALUES
(2, 'John Doe', 'The food was delicious and the service was excellent!', 5),
(7, 'Jane Smith', 'I was disappointed with the quality of the food and the service was slow.', 2),
(15, 'Sarah Johnson', 'The atmosphere was great, but the food was just okay.', 3),
(7, 'Mike Adams', 'The restaurant was very clean and the staff was friendly, but the food was average.', 3),
(7, 'Emily Brown', 'The food was amazing, but the restaurant was very noisy and it was hard to hear my companions.', 4)
(6, 'Michael Lee', 'The food was fantastic and the atmosphere was very cozy and intimate.', 5),
(7, 'Amanda Chen', 'I had a terrible experience - the food was cold and the service was rude.', 1),
(15, 'Daniel Kim', 'The food was good, but the portions were quite small for the price.', 3),
(2, 'Jessica Lee', 'The service was excellent, but the food was not as good as I was hoping.', 4),
(9, 'Matthew Lee', 'The restaurant was very busy and noisy, but the food was delicious!', 4);

-- Count the number of reviews
SELECT COUNT (*) FROM reviews; -- but may count reviews without rating
SELECT COUNT (rating) FROM reviews;

-- Other aggregate functions
SELECT MAX (rating) FROM reviews;
SELECT MIN (rating) FROM reviews;
SELECT AVG (rating) FROM reviews;
SELECT TRUNC( AVG (rating), 2) FROM reviews; -- only take up to 2 decimals, not rounded off
SELECT TRUNC( AVG (rating), 2) AS average_review FROM reviews; -- Overwrites default result name
SELECT name AS reviewer_name, rating AS reviewer_rating FROM reviews;
SELECT location, count(location) FROM restaurants; -- all rows will show count = 1, even if the location names are the same. This will return error anyways
SELECT location, count(location) FROM restaurants GROUP BY location; -- same location names are grouped together, and the count column adds up


SELECT TRUNC( AVG (rating), 2) AS average_review FROM reviews WHERE restaurant_id = 7;
SELECT COUNT (rating) AS count_review FROM reviews WHERE restaurant_id = 7;

SELECT restaurant_id, AVG (rating), COUNT (rating) FROM reviews GROUP BY restaurant_id;


-- joins
-- restaurants INNER JOIN reviews = shows only restaurants + reviews data where a restaurant has at least 1 review (or a review that has at least 1 restaurant)
SELECT * FROM restaurants INNER JOIN reviews ON restaurants.id = reviews.restaurant_id;
-- restaurants LEFT JOIN reviews = shows all restaurants + reviews data for restaurants, whether or not they have reviews
-- restaurants RIGHT JOIN reviews = shows all restaurants + reviews data for reviews, whether or not they have restaurants

SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id;
SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id WHERE id = 7;