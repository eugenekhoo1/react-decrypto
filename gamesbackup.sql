--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1

-- Started on 2023-09-28 18:54:24 +08

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 35714)
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    game_id integer NOT NULL,
    team1_players character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    team2_players character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    team1_words character varying[] NOT NULL,
    team2_words character varying[] NOT NULL,
    team1_interceptions integer DEFAULT 0,
    team2_interceptions integer DEFAULT 0,
    team1_miscommunications integer DEFAULT 0,
    team2_miscommunications integer DEFAULT 0,
    winner integer,
    status public.status DEFAULT 'Not Started'::public.status
);


ALTER TABLE public.games OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 35713)
-- Name: games_game_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.games_game_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.games_game_id_seq OWNER TO postgres;

--
-- TOC entry 3624 (class 0 OID 0)
-- Dependencies: 214
-- Name: games_game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.games_game_id_seq OWNED BY public.games.game_id;


--
-- TOC entry 3467 (class 2604 OID 35717)
-- Name: games game_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games ALTER COLUMN game_id SET DEFAULT nextval('public.games_game_id_seq'::regclass);


--
-- TOC entry 3476 (class 2606 OID 35725)
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (game_id);


-- Completed on 2023-09-28 18:54:25 +08

--
-- PostgreSQL database dump complete
--

