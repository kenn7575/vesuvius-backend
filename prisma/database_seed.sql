toc.dat                                                                                             0000600 0004000 0002000 00000100201 14720035407 0014433 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        PGDMP           	        
    |            Cafe-vesuvius    14.13 (Homebrew)    16.0 b    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false         �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false         �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false         �           1262    16441    Cafe-vesuvius    DATABASE     q   CREATE DATABASE "Cafe-vesuvius" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';
    DROP DATABASE "Cafe-vesuvius";
                kennikollemorten    false                     2615    17693    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                kennikollemorten    false         �           0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                   kennikollemorten    false    5         �           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                   kennikollemorten    false    5         �            1255    18073    get_opening_hours(date, date)    FUNCTION     >  CREATE FUNCTION public.get_opening_hours(start_date date, end_date date) RETURNS TABLE(date date, opening_time time without time zone, closing_time time without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(start_date, end_date, interval '1 day')::DATE AS date_col
    ), date_info AS (
        SELECT
            ds.date_col,
            CASE 
                WHEN soh.date IS NOT NULL THEN soh.opening_time
                ELSE doh.opening_time
            END AS opening_time,
            CASE 
                WHEN soh.date IS NOT NULL THEN soh.closing_time
                ELSE doh.closing_time
            END AS closing_time
        FROM date_series ds
        LEFT JOIN specific_open_hours soh ON ds.date_col = soh.date
        LEFT JOIN default_open_hours doh ON doh.day_of_week = EXTRACT(ISODOW FROM ds.date_col)::SMALLINT
    )
    SELECT
        date_info.date_col AS date,
        date_info.opening_time,
        date_info.closing_time
    FROM date_info
    ORDER BY date_info.date_col;
END;
$$;
 H   DROP FUNCTION public.get_opening_hours(start_date date, end_date date);
       public          kennikollemorten    false    5         �            1259    17695 
   cafe_table    TABLE     t   CREATE TABLE public.cafe_table (
    id integer NOT NULL,
    capacity integer NOT NULL,
    nr integer NOT NULL
);
    DROP TABLE public.cafe_table;
       public         heap    kennikollemorten    false    5         �            1259    17694    cafe_table_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cafe_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.cafe_table_id_seq;
       public          kennikollemorten    false    210    5         �           0    0    cafe_table_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.cafe_table_id_seq OWNED BY public.cafe_table.id;
          public          kennikollemorten    false    209         �            1259    18061    default_open_hours    TABLE     h  CREATE TABLE public.default_open_hours (
    day_of_week smallint NOT NULL,
    opening_time time without time zone,
    closing_time time without time zone,
    CONSTRAINT default_open_hours_check CHECK ((((opening_time IS NULL) AND (closing_time IS NULL)) OR ((opening_time IS NOT NULL) AND (closing_time IS NOT NULL) AND (opening_time < closing_time))))
);
 &   DROP TABLE public.default_open_hours;
       public         heap    kennikollemorten    false    5         �            1259    17702 	   menu_item    TABLE     �  CREATE TABLE public.menu_item (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    type_id integer NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    price_in_oere integer NOT NULL,
    comment text,
    is_lacking_ingredient boolean,
    is_sold_out boolean
);
    DROP TABLE public.menu_item;
       public         heap    kennikollemorten    false    5         �            1259    17701    menu_item_id_seq    SEQUENCE     �   CREATE SEQUENCE public.menu_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.menu_item_id_seq;
       public          kennikollemorten    false    212    5         �           0    0    menu_item_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.menu_item_id_seq OWNED BY public.menu_item.id;
          public          kennikollemorten    false    211         �            1259    17787    menu_item_types    TABLE       CREATE TABLE public.menu_item_types (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_food boolean
);
 #   DROP TABLE public.menu_item_types;
       public         heap    kennikollemorten    false    5         �            1259    17786    menu_item_types_id_seq    SEQUENCE     �   CREATE SEQUENCE public.menu_item_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.menu_item_types_id_seq;
       public          kennikollemorten    false    5    228         �           0    0    menu_item_types_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.menu_item_types_id_seq OWNED BY public.menu_item_types.id;
          public          kennikollemorten    false    227         �            1259    17714    order    TABLE     =  CREATE TABLE public."order" (
    id integer NOT NULL,
    waiter_id integer NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    comment character varying,
    status character varying NOT NULL
);
    DROP TABLE public."order";
       public         heap    kennikollemorten    false    5         �            1259    17713    order_id_seq    SEQUENCE     �   CREATE SEQUENCE public.order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.order_id_seq;
       public          kennikollemorten    false    5    214         �           0    0    order_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.order_id_seq OWNED BY public."order".id;
          public          kennikollemorten    false    213         �            1259    17725    order_items    TABLE     �   CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    menu_item_id integer NOT NULL,
    count integer DEFAULT 1 NOT NULL,
    comment text,
    price_in_oere integer DEFAULT 0 NOT NULL
);
    DROP TABLE public.order_items;
       public         heap    kennikollemorten    false    5         �            1259    17724    order_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.order_items_id_seq;
       public          kennikollemorten    false    5    216         �           0    0    order_items_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;
          public          kennikollemorten    false    215         �            1259    17736    personel    TABLE     �  CREATE TABLE public.personel (
    id integer NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    phone_number character varying NOT NULL,
    email character varying NOT NULL,
    role_id integer NOT NULL,
    password character varying NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.personel;
       public         heap    kennikollemorten    false    5         �            1259    17735    personel_id_seq    SEQUENCE     �   CREATE SEQUENCE public.personel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.personel_id_seq;
       public          kennikollemorten    false    218    5         �           0    0    personel_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.personel_id_seq OWNED BY public.personel.id;
          public          kennikollemorten    false    217         �            1259    17778    refresh_tokens    TABLE     w   CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL
);
 "   DROP TABLE public.refresh_tokens;
       public         heap    kennikollemorten    false    5         �            1259    17777    refresh_tokens_id_seq    SEQUENCE     �   CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.refresh_tokens_id_seq;
       public          kennikollemorten    false    226    5         �           0    0    refresh_tokens_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;
          public          kennikollemorten    false    225         �            1259    17747    reservation    TABLE       CREATE TABLE public.reservation (
    id integer NOT NULL,
    "time" timestamp(6) with time zone NOT NULL,
    duration_in_minutes integer NOT NULL,
    number_of_people integer NOT NULL,
    waiter_id integer,
    status character varying NOT NULL,
    comment character varying,
    customer_name character varying NOT NULL,
    customer_phone_number character varying NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.reservation;
       public         heap    kennikollemorten    false    5         �            1259    17746    reservation_id_seq    SEQUENCE     �   CREATE SEQUENCE public.reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.reservation_id_seq;
       public          kennikollemorten    false    5    220         �           0    0    reservation_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.reservation_id_seq OWNED BY public.reservation.id;
          public          kennikollemorten    false    219         �            1259    17758    role    TABLE     �   CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.role;
       public         heap    kennikollemorten    false    5         �            1259    17757    role_id_seq    SEQUENCE     �   CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.role_id_seq;
       public          kennikollemorten    false    5    222         �           0    0    role_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;
          public          kennikollemorten    false    221         �            1259    18067    specific_open_hours    TABLE     _  CREATE TABLE public.specific_open_hours (
    date date NOT NULL,
    opening_time time without time zone,
    closing_time time without time zone,
    CONSTRAINT specific_open_hours_check CHECK ((((opening_time IS NULL) AND (closing_time IS NULL)) OR ((opening_time IS NOT NULL) AND (closing_time IS NOT NULL) AND (opening_time < closing_time))))
);
 '   DROP TABLE public.specific_open_hours;
       public         heap    kennikollemorten    false    5         �            1259    17769 !   tables_in_orders_and_reservations    TABLE     8  CREATE TABLE public.tables_in_orders_and_reservations (
    id integer NOT NULL,
    order_id integer,
    reservation_id integer,
    table_id integer NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 5   DROP TABLE public.tables_in_orders_and_reservations;
       public         heap    kennikollemorten    false    5         �            1259    17768 (   tables_in_orders_and_reservations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tables_in_orders_and_reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ?   DROP SEQUENCE public.tables_in_orders_and_reservations_id_seq;
       public          kennikollemorten    false    5    224         �           0    0 (   tables_in_orders_and_reservations_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE public.tables_in_orders_and_reservations_id_seq OWNED BY public.tables_in_orders_and_reservations.id;
          public          kennikollemorten    false    223         �           2604    17698    cafe_table id    DEFAULT     n   ALTER TABLE ONLY public.cafe_table ALTER COLUMN id SET DEFAULT nextval('public.cafe_table_id_seq'::regclass);
 <   ALTER TABLE public.cafe_table ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    209    210    210         �           2604    17705    menu_item id    DEFAULT     l   ALTER TABLE ONLY public.menu_item ALTER COLUMN id SET DEFAULT nextval('public.menu_item_id_seq'::regclass);
 ;   ALTER TABLE public.menu_item ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    212    211    212         �           2604    17790    menu_item_types id    DEFAULT     x   ALTER TABLE ONLY public.menu_item_types ALTER COLUMN id SET DEFAULT nextval('public.menu_item_types_id_seq'::regclass);
 A   ALTER TABLE public.menu_item_types ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    227    228    228         �           2604    17717    order id    DEFAULT     f   ALTER TABLE ONLY public."order" ALTER COLUMN id SET DEFAULT nextval('public.order_id_seq'::regclass);
 9   ALTER TABLE public."order" ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    213    214    214         �           2604    17728    order_items id    DEFAULT     p   ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);
 =   ALTER TABLE public.order_items ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    215    216    216         �           2604    17739    personel id    DEFAULT     j   ALTER TABLE ONLY public.personel ALTER COLUMN id SET DEFAULT nextval('public.personel_id_seq'::regclass);
 :   ALTER TABLE public.personel ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    218    217    218         �           2604    17781    refresh_tokens id    DEFAULT     v   ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);
 @   ALTER TABLE public.refresh_tokens ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    226    225    226         �           2604    17750    reservation id    DEFAULT     p   ALTER TABLE ONLY public.reservation ALTER COLUMN id SET DEFAULT nextval('public.reservation_id_seq'::regclass);
 =   ALTER TABLE public.reservation ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    219    220    220         �           2604    17761    role id    DEFAULT     b   ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);
 6   ALTER TABLE public.role ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    222    221    222         �           2604    17772 $   tables_in_orders_and_reservations id    DEFAULT     �   ALTER TABLE ONLY public.tables_in_orders_and_reservations ALTER COLUMN id SET DEFAULT nextval('public.tables_in_orders_and_reservations_id_seq'::regclass);
 S   ALTER TABLE public.tables_in_orders_and_reservations ALTER COLUMN id DROP DEFAULT;
       public          kennikollemorten    false    224    223    224         �          0    17695 
   cafe_table 
   TABLE DATA           6   COPY public.cafe_table (id, capacity, nr) FROM stdin;
    public          kennikollemorten    false    210       3713.dat �          0    18061    default_open_hours 
   TABLE DATA           U   COPY public.default_open_hours (day_of_week, opening_time, closing_time) FROM stdin;
    public          kennikollemorten    false    229       3732.dat �          0    17702 	   menu_item 
   TABLE DATA           �   COPY public.menu_item (id, name, description, type_id, created_at, updated_at, is_active, price_in_oere, comment, is_lacking_ingredient, is_sold_out) FROM stdin;
    public          kennikollemorten    false    212       3715.dat �          0    17787    menu_item_types 
   TABLE DATA           T   COPY public.menu_item_types (id, name, created_at, updated_at, is_food) FROM stdin;
    public          kennikollemorten    false    228       3731.dat �          0    17714    order 
   TABLE DATA           Y   COPY public."order" (id, waiter_id, created_at, updated_at, comment, status) FROM stdin;
    public          kennikollemorten    false    214       3717.dat �          0    17725    order_items 
   TABLE DATA           `   COPY public.order_items (id, order_id, menu_item_id, count, comment, price_in_oere) FROM stdin;
    public          kennikollemorten    false    216       3719.dat �          0    17736    personel 
   TABLE DATA           }   COPY public.personel (id, first_name, last_name, phone_number, email, role_id, password, created_at, updated_at) FROM stdin;
    public          kennikollemorten    false    218       3721.dat �          0    17778    refresh_tokens 
   TABLE DATA           <   COPY public.refresh_tokens (id, user_id, token) FROM stdin;
    public          kennikollemorten    false    226       3729.dat �          0    17747    reservation 
   TABLE DATA           �   COPY public.reservation (id, "time", duration_in_minutes, number_of_people, waiter_id, status, comment, customer_name, customer_phone_number, created_at, updated_at) FROM stdin;
    public          kennikollemorten    false    220       3723.dat �          0    17758    role 
   TABLE DATA           @   COPY public.role (id, name, created_at, updated_at) FROM stdin;
    public          kennikollemorten    false    222       3725.dat �          0    18067    specific_open_hours 
   TABLE DATA           O   COPY public.specific_open_hours (date, opening_time, closing_time) FROM stdin;
    public          kennikollemorten    false    230       3733.dat �          0    17769 !   tables_in_orders_and_reservations 
   TABLE DATA           {   COPY public.tables_in_orders_and_reservations (id, order_id, reservation_id, table_id, created_at, updated_at) FROM stdin;
    public          kennikollemorten    false    224       3727.dat �           0    0    cafe_table_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.cafe_table_id_seq', 3, true);
          public          kennikollemorten    false    209         �           0    0    menu_item_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.menu_item_id_seq', 4, true);
          public          kennikollemorten    false    211         �           0    0    menu_item_types_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.menu_item_types_id_seq', 6, true);
          public          kennikollemorten    false    227         �           0    0    order_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.order_id_seq', 2, true);
          public          kennikollemorten    false    213         �           0    0    order_items_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.order_items_id_seq', 3, true);
          public          kennikollemorten    false    215         �           0    0    personel_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.personel_id_seq', 5, true);
          public          kennikollemorten    false    217         �           0    0    refresh_tokens_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 38, true);
          public          kennikollemorten    false    225         �           0    0    reservation_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.reservation_id_seq', 3, true);
          public          kennikollemorten    false    219         �           0    0    role_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.role_id_seq', 3, true);
          public          kennikollemorten    false    221         �           0    0 (   tables_in_orders_and_reservations_id_seq    SEQUENCE SET     V   SELECT pg_catalog.setval('public.tables_in_orders_and_reservations_id_seq', 7, true);
          public          kennikollemorten    false    223         �           2606    17700    cafe_table cafe_table_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.cafe_table
    ADD CONSTRAINT cafe_table_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.cafe_table DROP CONSTRAINT cafe_table_pkey;
       public            kennikollemorten    false    210         �           2606    18066 *   default_open_hours default_open_hours_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY public.default_open_hours
    ADD CONSTRAINT default_open_hours_pkey PRIMARY KEY (day_of_week);
 T   ALTER TABLE ONLY public.default_open_hours DROP CONSTRAINT default_open_hours_pkey;
       public            kennikollemorten    false    229         �           2606    17712    menu_item menu_item_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.menu_item DROP CONSTRAINT menu_item_pkey;
       public            kennikollemorten    false    212         �           2606    17796 $   menu_item_types order_item_type_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.menu_item_types
    ADD CONSTRAINT order_item_type_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.menu_item_types DROP CONSTRAINT order_item_type_pkey;
       public            kennikollemorten    false    228         �           2606    17734    order_items order_items_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_pkey;
       public            kennikollemorten    false    216         �           2606    17723    order order_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."order" DROP CONSTRAINT order_pkey;
       public            kennikollemorten    false    214         �           2606    17745    personel personel_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.personel
    ADD CONSTRAINT personel_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.personel DROP CONSTRAINT personel_pkey;
       public            kennikollemorten    false    218         �           2606    17785 "   refresh_tokens refresh_tokens_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
       public            kennikollemorten    false    226         �           2606    17756    reservation reservation_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.reservation DROP CONSTRAINT reservation_pkey;
       public            kennikollemorten    false    220         �           2606    17767    role role_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.role DROP CONSTRAINT role_pkey;
       public            kennikollemorten    false    222         �           2606    18072 ,   specific_open_hours specific_open_hours_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.specific_open_hours
    ADD CONSTRAINT specific_open_hours_pkey PRIMARY KEY (date);
 V   ALTER TABLE ONLY public.specific_open_hours DROP CONSTRAINT specific_open_hours_pkey;
       public            kennikollemorten    false    230         �           2606    17776 H   tables_in_orders_and_reservations tables_in_orders_and_reservations_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.tables_in_orders_and_reservations
    ADD CONSTRAINT tables_in_orders_and_reservations_pkey PRIMARY KEY (id);
 r   ALTER TABLE ONLY public.tables_in_orders_and_reservations DROP CONSTRAINT tables_in_orders_and_reservations_pkey;
       public            kennikollemorten    false    224         �           1259    17797    cafe_table_nr_key    INDEX     M   CREATE UNIQUE INDEX cafe_table_nr_key ON public.cafe_table USING btree (nr);
 %   DROP INDEX public.cafe_table_nr_key;
       public            kennikollemorten    false    210         �           1259    17798    personel_email_key    INDEX     O   CREATE UNIQUE INDEX personel_email_key ON public.personel USING btree (email);
 &   DROP INDEX public.personel_email_key;
       public            kennikollemorten    false    218         �           1259    17800    refresh_tokens_token_key    INDEX     [   CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);
 ,   DROP INDEX public.refresh_tokens_token_key;
       public            kennikollemorten    false    226         �           1259    17799    refresh_tokens_user_id_key    INDEX     _   CREATE UNIQUE INDEX refresh_tokens_user_id_key ON public.refresh_tokens USING btree (user_id);
 .   DROP INDEX public.refresh_tokens_user_id_key;
       public            kennikollemorten    false    226         �           2606    17801     menu_item menu_item_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.menu_item_types(id);
 J   ALTER TABLE ONLY public.menu_item DROP CONSTRAINT menu_item_type_id_fkey;
       public          kennikollemorten    false    3558    228    212         �           2606    17811 )   order_items order_items_menu_item_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);
 S   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_menu_item_id_fkey;
       public          kennikollemorten    false    216    212    3539         �           2606    17816 %   order_items order_items_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_order_id_fkey;
       public          kennikollemorten    false    216    214    3541         �           2606    17806    order order_waiter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_waiter_id_fkey FOREIGN KEY (waiter_id) REFERENCES public.personel(id);
 F   ALTER TABLE ONLY public."order" DROP CONSTRAINT order_waiter_id_fkey;
       public          kennikollemorten    false    218    3546    214         �           2606    17821    personel personel_role_id_fkey    FK CONSTRAINT     |   ALTER TABLE ONLY public.personel
    ADD CONSTRAINT personel_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id);
 H   ALTER TABLE ONLY public.personel DROP CONSTRAINT personel_role_id_fkey;
       public          kennikollemorten    false    222    3550    218         �           2606    17846 *   refresh_tokens refresh_tokens_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.personel(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.refresh_tokens DROP CONSTRAINT refresh_tokens_user_id_fkey;
       public          kennikollemorten    false    226    218    3546         �           2606    17826 &   reservation reservation_waiter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_waiter_id_fkey FOREIGN KEY (waiter_id) REFERENCES public.personel(id);
 P   ALTER TABLE ONLY public.reservation DROP CONSTRAINT reservation_waiter_id_fkey;
       public          kennikollemorten    false    218    220    3546         �           2606    17831 Q   tables_in_orders_and_reservations tables_in_orders_and_reservations_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tables_in_orders_and_reservations
    ADD CONSTRAINT tables_in_orders_and_reservations_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id);
 {   ALTER TABLE ONLY public.tables_in_orders_and_reservations DROP CONSTRAINT tables_in_orders_and_reservations_order_id_fkey;
       public          kennikollemorten    false    3541    224    214         �           2606    17836 W   tables_in_orders_and_reservations tables_in_orders_and_reservations_reservation_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tables_in_orders_and_reservations
    ADD CONSTRAINT tables_in_orders_and_reservations_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservation(id);
 �   ALTER TABLE ONLY public.tables_in_orders_and_reservations DROP CONSTRAINT tables_in_orders_and_reservations_reservation_id_fkey;
       public          kennikollemorten    false    3548    220    224         �           2606    17841 Q   tables_in_orders_and_reservations tables_in_orders_and_reservations_table_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tables_in_orders_and_reservations
    ADD CONSTRAINT tables_in_orders_and_reservations_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.cafe_table(id);
 {   ALTER TABLE ONLY public.tables_in_orders_and_reservations DROP CONSTRAINT tables_in_orders_and_reservations_table_id_fkey;
       public          kennikollemorten    false    210    224    3537                                                                                                                                                                                                                                                                                                                                                                                                       3713.dat                                                                                            0000600 0004000 0002000 00000000027 14720035407 0014250 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	2	1
2	4	2
3	6	3
\.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         3732.dat                                                                                            0000600 0004000 0002000 00000000221 14720035407 0014245 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	10:00:00	22:00:00
2	10:00:00	22:00:00
3	10:00:00	22:00:00
4	10:00:00	22:00:00
5	10:00:00	22:00:00
6	10:00:00	22:00:00
7	10:00:00	22:00:00
\.


                                                                                                                                                                                                                                                                                                                                                                               3715.dat                                                                                            0000600 0004000 0002000 00000000606 14720035407 0014255 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	Bruschetta	Grilled bread with tomato and basil	1	17:06:22.560652+01	17:06:22.560652+01	t	4500	\N	f	f
2	Steak	Grilled sirloin steak with sides	2	17:06:22.560652+01	17:06:22.560652+01	t	15000	\N	f	f
3	Cheesecake	Classic New York cheesecake	3	17:06:22.560652+01	17:06:22.560652+01	t	6000	\N	f	f
4	Red Wine	Glass of premium red wine	4	17:06:22.560652+01	17:06:22.560652+01	t	8000	\N	f	f
\.


                                                                                                                          3731.dat                                                                                            0000600 0004000 0002000 00000000465 14720035407 0014256 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	Forret	17:06:22.560652+01	17:06:22.560652+01	t
2	Hovedret	17:06:22.560652+01	17:06:22.560652+01	t
3	Desert	17:06:22.560652+01	17:06:22.560652+01	t
4	Cocktail	17:06:22.560652+01	17:06:22.560652+01	f
5	Varm drik	10:35:16.631196+01	10:35:16.631196+01	f
6	kold drik	10:35:16.631196+01	10:35:16.631196+01	f
\.


                                                                                                                                                                                                           3717.dat                                                                                            0000600 0004000 0002000 00000000267 14720035407 0014262 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	1	2024-11-11 17:06:22.560652+01	2024-11-11 17:06:22.560652+01	Customer prefers medium-rare	Completed
2	1	2024-11-11 17:06:22.560652+01	2024-11-11 17:06:22.560652+01	\N	Pending
\.


                                                                                                                                                                                                                                                                                                                                         3719.dat                                                                                            0000600 0004000 0002000 00000000100 14720035407 0014246 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	1	2	1		0
2	1	4	2		0
3	2	4	1	Large glass - for the boss	0
\.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                3721.dat                                                                                            0000600 0004000 0002000 00000001201 14720035407 0014242 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	John	Doe	555-1234	john.doe@example.com	1	password123	2024-11-11 17:06:22.560652+01	17:06:22.560652+01
2	Jane	Smith	555-5678	jane.smith@example.com	2	password456	2024-11-11 17:06:22.560652+01	17:06:22.560652+01
3	Alice	Johnson	555-9012	alice.johnson@example.com	3	password789	2024-11-11 17:06:22.560652+01	17:06:22.560652+01
4	Kenni	Kollemorten	53805027	kenn7575_2@gmail.com	2	$2b$13$Hh4GmKaTbroQSNQZFAEnYebtdxtGaGgsVP/9H9VaQKjVP2Q.xxYsq	2024-11-12 14:10:37.024+01	13:10:37.024+00
5	Kenni	Kollemorten	53805027	kenn7575@gmail.com	2	$2b$13$ohNI2A8gnTsu2w4upo6.aOzy9GCN0qJFs.E8OdCgYYBnN5OcRP/DO	2024-11-12 19:40:13.655+01	18:40:13.655+00
\.


                                                                                                                                                                                                                                                                                                                                                                                               3729.dat                                                                                            0000600 0004000 0002000 00000001243 14720035407 0014260 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	5	cAh4fsPbIY0CgBwuHN3LKA==:aGwx0OTFl5qRZG17QRo3yjHh8Y28JdF3GqQS6yoxRkM5al8c/P8jFNVOORbG8yv4/dchpD37m+tbA6vmT05vBX5m7d9V+iIcdestMyj0V8wekQ8Zz+EwLBZLFzCIzZjes/ykjLcrnkV+xU5lLAfMLpEFBg/yor74VaMUWKWqFff8ZeOYmiSv5WIWcQtIeeRXOuS70mqRpih62hv8I43841j1QIC5sZRkoeKGknYdRFtY5EtVVueKoCrDVeBgPQ/YVgrUj2r6HpY3DThfMoZP+btdZjjHSysPwsKA3RmuTbntDNVzx3720lxBsllGCbFRxb/3a9cbCN6VrK3RRUaIfIeoockBObZU7JzbXV4ypVqOubsOMWJvrmO+T8EPQkYzQKA3KXVSKZ6s97EE2MfzB5E4Eap0JOZ8a0z/ieNsKILM3NaIhc/CrbwtvblhPifvbu4Wd+J38RclZ2AmeouAUO32zKV/1LqW3lwCpM+4ffyV1na0SQqOqQDjMx5xt59QqsM28psmvOhra5QGgpv+CxCYFIzEiiPq/4OsX7whjK200ohI7oltgm5I+HFbxJXO+pAivVeEiRipN9OnWHW6Y7DYZqC0TUXV6NlRGuix4dwb4K42gM0QAqcdOT6Z6Ep7
\.


                                                                                                                                                                                                                                                                                                                                                             3723.dat                                                                                            0000600 0004000 0002000 00000000535 14720035407 0014255 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	2024-11-12 17:06:22.560652+01	90	4	1	Confirmed	Birthday celebration	Michael Brown	555-3456	17:06:22.560652+01	17:06:22.560652+01
3	2024-11-20 13:00:00+01	120	12	1	Confirmed	\N	Some name	12345678	17:31:06.627366+01	17:31:06.627366+01
2	2024-11-21 17:06:22.560652+01	60	2	1	Pending	\N	Sarah Davis	555-7890	17:06:22.560652+01	17:06:22.560652+01
\.


                                                                                                                                                                   3725.dat                                                                                            0000600 0004000 0002000 00000000221 14720035407 0014247 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	Waiter	17:06:22.560652+01	17:06:22.560652+01
2	Chef	17:06:22.560652+01	17:06:22.560652+01
3	Manager	17:06:22.560652+01	17:06:22.560652+01
\.


                                                                                                                                                                                                                                                                                                                                                                               3733.dat                                                                                            0000600 0004000 0002000 00000000063 14720035407 0014252 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        2024-12-24	\N	\N
2024-12-31	10:00:00	18:00:00
\.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                             3727.dat                                                                                            0000600 0004000 0002000 00000000516 14720035407 0014260 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        1	1	\N	2	17:06:22.560652+01	17:06:22.560652+01
2	2	\N	1	17:06:22.560652+01	17:06:22.560652+01
3	\N	1	3	17:06:22.560652+01	17:06:22.560652+01
4	\N	2	1	17:06:22.560652+01	17:06:22.560652+01
5	\N	3	1	17:32:00.396348+01	17:32:00.396348+01
6	\N	3	2	17:32:00.396348+01	17:32:00.396348+01
7	\N	3	3	17:32:00.396348+01	17:32:00.396348+01
\.


                                                                                                                                                                                  restore.sql                                                                                         0000600 0004000 0002000 00000064542 14720035407 0015401 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        --
-- NOTE:
--
-- File paths need to be edited. Search for $$PATH$$ and
-- replace it with the path to the directory containing
-- the extracted data files.
--
--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Homebrew)
-- Dumped by pg_dump version 16.0

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

DROP DATABASE "Cafe-vesuvius";
--
-- Name: Cafe-vesuvius; Type: DATABASE; Schema: -; Owner: kennikollemorten
--

CREATE DATABASE "Cafe-vesuvius" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


ALTER DATABASE "Cafe-vesuvius" OWNER TO kennikollemorten;

\connect -reuse-previous=on "dbname='Cafe-vesuvius'"

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: kennikollemorten
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO kennikollemorten;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: kennikollemorten
--

COMMENT ON SCHEMA public IS '';


--
-- Name: get_opening_hours(date, date); Type: FUNCTION; Schema: public; Owner: kennikollemorten
--

CREATE FUNCTION public.get_opening_hours(start_date date, end_date date) RETURNS TABLE(date date, opening_time time without time zone, closing_time time without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(start_date, end_date, interval '1 day')::DATE AS date_col
    ), date_info AS (
        SELECT
            ds.date_col,
            CASE 
                WHEN soh.date IS NOT NULL THEN soh.opening_time
                ELSE doh.opening_time
            END AS opening_time,
            CASE 
                WHEN soh.date IS NOT NULL THEN soh.closing_time
                ELSE doh.closing_time
            END AS closing_time
        FROM date_series ds
        LEFT JOIN specific_open_hours soh ON ds.date_col = soh.date
        LEFT JOIN default_open_hours doh ON doh.day_of_week = EXTRACT(ISODOW FROM ds.date_col)::SMALLINT
    )
    SELECT
        date_info.date_col AS date,
        date_info.opening_time,
        date_info.closing_time
    FROM date_info
    ORDER BY date_info.date_col;
END;
$$;


ALTER FUNCTION public.get_opening_hours(start_date date, end_date date) OWNER TO kennikollemorten;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cafe_table; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.cafe_table (
    id integer NOT NULL,
    capacity integer NOT NULL,
    nr integer NOT NULL
);


ALTER TABLE public.cafe_table OWNER TO kennikollemorten;

--
-- Name: cafe_table_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.cafe_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafe_table_id_seq OWNER TO kennikollemorten;

--
-- Name: cafe_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.cafe_table_id_seq OWNED BY public.cafe_table.id;


--
-- Name: default_open_hours; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.default_open_hours (
    day_of_week smallint NOT NULL,
    opening_time time without time zone,
    closing_time time without time zone,
    CONSTRAINT default_open_hours_check CHECK ((((opening_time IS NULL) AND (closing_time IS NULL)) OR ((opening_time IS NOT NULL) AND (closing_time IS NOT NULL) AND (opening_time < closing_time))))
);


ALTER TABLE public.default_open_hours OWNER TO kennikollemorten;

--
-- Name: menu_item; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.menu_item (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    type_id integer NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    price_in_oere integer NOT NULL,
    comment text,
    is_lacking_ingredient boolean,
    is_sold_out boolean
);


ALTER TABLE public.menu_item OWNER TO kennikollemorten;

--
-- Name: menu_item_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.menu_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_item_id_seq OWNER TO kennikollemorten;

--
-- Name: menu_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.menu_item_id_seq OWNED BY public.menu_item.id;


--
-- Name: menu_item_types; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.menu_item_types (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_food boolean
);


ALTER TABLE public.menu_item_types OWNER TO kennikollemorten;

--
-- Name: menu_item_types_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.menu_item_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_item_types_id_seq OWNER TO kennikollemorten;

--
-- Name: menu_item_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.menu_item_types_id_seq OWNED BY public.menu_item_types.id;


--
-- Name: order; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public."order" (
    id integer NOT NULL,
    waiter_id integer NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    comment character varying,
    status character varying NOT NULL
);


ALTER TABLE public."order" OWNER TO kennikollemorten;

--
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_id_seq OWNER TO kennikollemorten;

--
-- Name: order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.order_id_seq OWNED BY public."order".id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    menu_item_id integer NOT NULL,
    count integer DEFAULT 1 NOT NULL,
    comment text,
    price_in_oere integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.order_items OWNER TO kennikollemorten;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO kennikollemorten;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: personel; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.personel (
    id integer NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    phone_number character varying NOT NULL,
    email character varying NOT NULL,
    role_id integer NOT NULL,
    password character varying NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.personel OWNER TO kennikollemorten;

--
-- Name: personel_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.personel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personel_id_seq OWNER TO kennikollemorten;

--
-- Name: personel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.personel_id_seq OWNED BY public.personel.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO kennikollemorten;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO kennikollemorten;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: reservation; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.reservation (
    id integer NOT NULL,
    "time" timestamp(6) with time zone NOT NULL,
    duration_in_minutes integer NOT NULL,
    number_of_people integer NOT NULL,
    waiter_id integer,
    status character varying NOT NULL,
    comment character varying,
    customer_name character varying NOT NULL,
    customer_phone_number character varying NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reservation OWNER TO kennikollemorten;

--
-- Name: reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservation_id_seq OWNER TO kennikollemorten;

--
-- Name: reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.reservation_id_seq OWNED BY public.reservation.id;


--
-- Name: role; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role OWNER TO kennikollemorten;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_id_seq OWNER TO kennikollemorten;

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: specific_open_hours; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.specific_open_hours (
    date date NOT NULL,
    opening_time time without time zone,
    closing_time time without time zone,
    CONSTRAINT specific_open_hours_check CHECK ((((opening_time IS NULL) AND (closing_time IS NULL)) OR ((opening_time IS NOT NULL) AND (closing_time IS NOT NULL) AND (opening_time < closing_time))))
);


ALTER TABLE public.specific_open_hours OWNER TO kennikollemorten;

--
-- Name: tables_in_orders_and_reservations; Type: TABLE; Schema: public; Owner: kennikollemorten
--

CREATE TABLE public.tables_in_orders_and_reservations (
    id integer NOT NULL,
    order_id integer,
    reservation_id integer,
    table_id integer NOT NULL,
    created_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at time(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tables_in_orders_and_reservations OWNER TO kennikollemorten;

--
-- Name: tables_in_orders_and_reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: kennikollemorten
--

CREATE SEQUENCE public.tables_in_orders_and_reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tables_in_orders_and_reservations_id_seq OWNER TO kennikollemorten;

--
-- Name: tables_in_orders_and_reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kennikollemorten
--

ALTER SEQUENCE public.tables_in_orders_and_reservations_id_seq OWNED BY public.tables_in_orders_and_reservations.id;


--
-- Name: cafe_table id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.cafe_table ALTER COLUMN id SET DEFAULT nextval('public.cafe_table_id_seq'::regclass);


--
-- Name: menu_item id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.menu_item ALTER COLUMN id SET DEFAULT nextval('public.menu_item_id_seq'::regclass);


--
-- Name: menu_item_types id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.menu_item_types ALTER COLUMN id SET DEFAULT nextval('public.menu_item_types_id_seq'::regclass);


--
-- Name: order id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public."order" ALTER COLUMN id SET DEFAULT nextval('public.order_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: personel id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.personel ALTER COLUMN id SET DEFAULT nextval('public.personel_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: reservation id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.reservation ALTER COLUMN id SET DEFAULT nextval('public.reservation_id_seq'::regclass);


--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Name: tables_in_orders_and_reservations id; Type: DEFAULT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.tables_in_orders_and_reservations ALTER COLUMN id SET DEFAULT nextval('public.tables_in_orders_and_reservations_id_seq'::regclass);


--
-- Data for Name: cafe_table; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.cafe_table (id, capacity, nr) FROM stdin;
\.
COPY public.cafe_table (id, capacity, nr) FROM '$$PATH$$/3713.dat';

--
-- Data for Name: default_open_hours; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.default_open_hours (day_of_week, opening_time, closing_time) FROM stdin;
\.
COPY public.default_open_hours (day_of_week, opening_time, closing_time) FROM '$$PATH$$/3732.dat';

--
-- Data for Name: menu_item; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.menu_item (id, name, description, type_id, created_at, updated_at, is_active, price_in_oere, comment, is_lacking_ingredient, is_sold_out) FROM stdin;
\.
COPY public.menu_item (id, name, description, type_id, created_at, updated_at, is_active, price_in_oere, comment, is_lacking_ingredient, is_sold_out) FROM '$$PATH$$/3715.dat';

--
-- Data for Name: menu_item_types; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.menu_item_types (id, name, created_at, updated_at, is_food) FROM stdin;
\.
COPY public.menu_item_types (id, name, created_at, updated_at, is_food) FROM '$$PATH$$/3731.dat';

--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public."order" (id, waiter_id, created_at, updated_at, comment, status) FROM stdin;
\.
COPY public."order" (id, waiter_id, created_at, updated_at, comment, status) FROM '$$PATH$$/3717.dat';

--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.order_items (id, order_id, menu_item_id, count, comment, price_in_oere) FROM stdin;
\.
COPY public.order_items (id, order_id, menu_item_id, count, comment, price_in_oere) FROM '$$PATH$$/3719.dat';

--
-- Data for Name: personel; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.personel (id, first_name, last_name, phone_number, email, role_id, password, created_at, updated_at) FROM stdin;
\.
COPY public.personel (id, first_name, last_name, phone_number, email, role_id, password, created_at, updated_at) FROM '$$PATH$$/3721.dat';

--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.refresh_tokens (id, user_id, token) FROM stdin;
\.
COPY public.refresh_tokens (id, user_id, token) FROM '$$PATH$$/3729.dat';

--
-- Data for Name: reservation; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.reservation (id, "time", duration_in_minutes, number_of_people, waiter_id, status, comment, customer_name, customer_phone_number, created_at, updated_at) FROM stdin;
\.
COPY public.reservation (id, "time", duration_in_minutes, number_of_people, waiter_id, status, comment, customer_name, customer_phone_number, created_at, updated_at) FROM '$$PATH$$/3723.dat';

--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.role (id, name, created_at, updated_at) FROM stdin;
\.
COPY public.role (id, name, created_at, updated_at) FROM '$$PATH$$/3725.dat';

--
-- Data for Name: specific_open_hours; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.specific_open_hours (date, opening_time, closing_time) FROM stdin;
\.
COPY public.specific_open_hours (date, opening_time, closing_time) FROM '$$PATH$$/3733.dat';

--
-- Data for Name: tables_in_orders_and_reservations; Type: TABLE DATA; Schema: public; Owner: kennikollemorten
--

COPY public.tables_in_orders_and_reservations (id, order_id, reservation_id, table_id, created_at, updated_at) FROM stdin;
\.
COPY public.tables_in_orders_and_reservations (id, order_id, reservation_id, table_id, created_at, updated_at) FROM '$$PATH$$/3727.dat';

--
-- Name: cafe_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.cafe_table_id_seq', 3, true);


--
-- Name: menu_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.menu_item_id_seq', 4, true);


--
-- Name: menu_item_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.menu_item_types_id_seq', 6, true);


--
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.order_id_seq', 2, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.order_items_id_seq', 3, true);


--
-- Name: personel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.personel_id_seq', 5, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 38, true);


--
-- Name: reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.reservation_id_seq', 3, true);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.role_id_seq', 3, true);


--
-- Name: tables_in_orders_and_reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kennikollemorten
--

SELECT pg_catalog.setval('public.tables_in_orders_and_reservations_id_seq', 7, true);


--
-- Name: cafe_table cafe_table_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.cafe_table
    ADD CONSTRAINT cafe_table_pkey PRIMARY KEY (id);


--
-- Name: default_open_hours default_open_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.default_open_hours
    ADD CONSTRAINT default_open_hours_pkey PRIMARY KEY (day_of_week);


--
-- Name: menu_item menu_item_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_pkey PRIMARY KEY (id);


--
-- Name: menu_item_types order_item_type_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.menu_item_types
    ADD CONSTRAINT order_item_type_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- Name: personel personel_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.personel
    ADD CONSTRAINT personel_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: reservation reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: specific_open_hours specific_open_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.specific_open_hours
    ADD CONSTRAINT specific_open_hours_pkey PRIMARY KEY (date);


--
-- Name: tables_in_orders_and_reservations tables_in_orders_and_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.tables_in_orders_and_reservations
    ADD CONSTRAINT tables_in_orders_and_reservations_pkey PRIMARY KEY (id);


--
-- Name: cafe_table_nr_key; Type: INDEX; Schema: public; Owner: kennikollemorten
--

CREATE UNIQUE INDEX cafe_table_nr_key ON public.cafe_table USING btree (nr);


--
-- Name: personel_email_key; Type: INDEX; Schema: public; Owner: kennikollemorten
--

CREATE UNIQUE INDEX personel_email_key ON public.personel USING btree (email);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: kennikollemorten
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_user_id_key; Type: INDEX; Schema: public; Owner: kennikollemorten
--

CREATE UNIQUE INDEX refresh_tokens_user_id_key ON public.refresh_tokens USING btree (user_id);


--
-- Name: menu_item menu_item_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.menu_item_types(id);


--
-- Name: order_items order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id) ON DELETE CASCADE;


--
-- Name: order order_waiter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_waiter_id_fkey FOREIGN KEY (waiter_id) REFERENCES public.personel(id);


--
-- Name: personel personel_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.personel
    ADD CONSTRAINT personel_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.personel(id) ON DELETE CASCADE;


--
-- Name: reservation reservation_waiter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_waiter_id_fkey FOREIGN KEY (waiter_id) REFERENCES public.personel(id);


--
-- Name: tables_in_orders_and_reservations tables_in_orders_and_reservations_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.tables_in_orders_and_reservations
    ADD CONSTRAINT tables_in_orders_and_reservations_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id);


--
-- Name: tables_in_orders_and_reservations tables_in_orders_and_reservations_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.tables_in_orders_and_reservations
    ADD CONSTRAINT tables_in_orders_and_reservations_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservation(id);


--
-- Name: tables_in_orders_and_reservations tables_in_orders_and_reservations_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kennikollemorten
--

ALTER TABLE ONLY public.tables_in_orders_and_reservations
    ADD CONSTRAINT tables_in_orders_and_reservations_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.cafe_table(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: kennikollemorten
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              