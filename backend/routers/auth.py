@router.post("/register")
def register(user: UserRegister):

    try:
        cursor.execute("SELECT * FROM users WHERE email=%s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User already exists")

        hashed = hash_password(user.password)

        cursor.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s)",
            (user.email, hashed)
        )

        conn.commit()
        return {"message": "User created successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
def login(user: UserLogin):

    try:
        cursor.execute(
            "SELECT id, email, password FROM users WHERE email=%s",
            (user.email,)
        )

        db_user = cursor.fetchone()

        if not db_user:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        user_id, email, db_password = db_user

        if not verify_password(user.password, db_password):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        token = create_access_token({"sub": str(user_id)})

        cursor.execute(
            "INSERT INTO games (user_id, status) VALUES (%s, %s) RETURNING id",
            (user_id, "active")
        )

        game_id = cursor.fetchone()[0]
        conn.commit()

        return {
            "access_token": token,
            "token_type": "bearer",
            "game_id": game_id
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))