export interface UserDTO {
    userid: number
    email: string
    username: string
    userPhoto?: string
    bio?: string
    gender?: string
    dateOfBirth?: string
    location?: string
    interestList?: string
    followedBusinessAccountIds?: number[]
    showDob?: boolean
    showLocation?: boolean
    showGender?: boolean
    showInterests?: boolean
}
