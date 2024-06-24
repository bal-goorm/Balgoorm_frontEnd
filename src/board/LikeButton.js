import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as solidThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as regularThumbsUp } from '@fortawesome/free-regular-svg-icons';
import styles from './LikeButton.module.css';

const LikeButton = ({ postId, initialLikesCount, initialIsLiked, onLikeToggle }) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);

    const handleLikeClick = async (event) => {
        event.stopPropagation();
        try {
            const url = isLiked 
                ? `https://k618de24a93cca.user-app.krampoline.com/api/boards/${postId}/unlike` 
                : `https://k618de24a93cca.user-app.krampoline.com/api/boards/${postId}/like`;

            const postData = { isLiked: !isLiked };

            const response = await axios.post(url, postData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            setIsLiked(!isLiked);
            setLikesCount(response.data.likesCount);
            onLikeToggle(postId, !isLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    useEffect(() => {
        setIsLiked(initialIsLiked);
        setLikesCount(initialLikesCount);
    }, [initialIsLiked, initialLikesCount]);

    return (
        <div className={styles.likeButtonContainer} onClick={handleLikeClick}>
            <div className={styles.iconContainer}>
                <FontAwesomeIcon icon={isLiked ? solidThumbsUp : regularThumbsUp} className={styles.icon} />
                <span className={styles.count}>{likesCount}</span>
            </div>
        </div>
    );
};

export default LikeButton;
